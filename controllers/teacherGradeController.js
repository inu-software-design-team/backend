const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const Class = require("../models/Class");
const Score = require("../models/Score");
const transporter = require("../config/mailConfig");
const Sentry = require("@sentry/node");

exports.selectYearForGrade = asyncHandler(async (req, res) => {
  try {
    const student_id = req.params.student_id;
    const teacher_id = req.session.user.linked[0];

    // 학번이 제공되지 않음
    if (!student_id) {
      return res.status(400).json({ message: "학생 학번을 제공해주세요." });
    }

    // 학번이 숫자가 아님
    if (isNaN(student_id)) {
      return res
        .status(400)
        .json({ message: "학생의 학번은 숫자여야 합니다." });
    }

    // 해당 학번의 학생이 존재하지 않음
    const theStudent = await Student.findOne({ student_id });
    if (!theStudent) {
      return res
        .status(404)
        .json({ message: "해당 학번의 학생이 존재하지 않습니다." });
    }

    // 해당 학생의 모든 성적 컬렉션 조회 후 연도 목록 추출
    const allGrades = await Score.distinct("year", { student_id: student_id });

    return res.status(200).json({
      message: `${student_id} 학생의 성적 연도 목록입니다.`,
      yearSelection: allGrades,
    });
  } catch (error) {
    console.error("학생 성적 조회 연도 선택 오류:", error);
    res
      .status(500)
      .json({ message: "학생 성적 조회 연도 선택지 불러오기 실패", error });

    Sentry.withScope((scope) => {
      scope.setLevel("error");
      scope.setTag("type", "api");
      scope.setTag("api", "selectYearForStudentGrade");
      Sentry.captureException(error);
    });
  }
});

// 성적/교사 탭 특정 학생 성적 조회 api
exports.checkGrade = asyncHandler(async (req, res) => {
  try {
    const student_id = req.params.student_id;
    // 조회하고자 하는 연도
    const year = req.params.year;
    // 해당 연도의 해당 학생 성적
    const studentGrade = await Score.findOne({
      student_id: student_id,
      year: year,
    });
    if (!studentGrade) {
      return res.status(400).json({
        message: "해당 연도의 해당 학생 성적이 존재하지 않습니다.",
      });
    }

    return res.status(200).json({
      message: "현재 학생의 성적입니다.",
      data: {
        // 학생의 성적. total_score, avrage 그리고 각 모든 과목들의 성적들은 중간/기말을 구분하기 위해 배열로 저장되어 있음
        student_id: student_id,
        grade: studentGrade,
      },
    });
  } catch (error) {
    console.error("학생 성적 조회 오류:", error);
    res.status(500).json({ message: "학생 성적 조회 실패", error });

    Sentry.withScope((scope) => {
      scope.setLevel("error");
      scope.setTag("type", "api");
      scope.setTag("api", "checkStudentGrade");
      Sentry.captureException(error);
    });
  }
});

exports.modifyGrade = asyncHandler(async (req, res) => {
  try {
    const student_id = req.params.student_id;
    const year = req.body.year;
    const subject = req.body.subject;
    const semester = req.body.semester;
    const term = req.body.term;
    const score = req.body.score;

    // 필요 데이터가 제공되지 않음
    if ((!year, !subject, !semester, !term, !score)) {
      return res.status(400).json({
        message: "필수 데이터를 제공해주세요.",
      });
    }

    // 해당 연도의 해당 학생 성적
    const studentGrade = await Score.findOne({
      student_id: student_id,
      year: year,
    });
    // 성적이 존재하지 않음
    if (!studentGrade) {
      return res.status(400).json({
        message: "해당 연도의 해당 학생 성적이 존재하지 않습니다.",
      });
    }
    if (!studentGrade[subject]) {
      return res.status(400).json({
        message: "해당 과목의 성적이 존재하지 않습니다.",
      });
    }
    if (!studentGrade[subject][semester]) {
      return res.status(400).json({
        message: "해당 학기의 성적이 존재하지 않습니다.",
      });
    }
    if (!studentGrade[subject][semester][term]) {
      return res.status(400).json({
        message: "해당 중간/기말의 성적이 존재하지 않습니다.",
      });
    }
    // 성적 존재
    // 점수만 수정
    studentGrade[subject][semester][term] = score;
    studentGrade.markModified(`${subject}.${semester}.${term}`);
    await studentGrade.save();

    // 다시 조회 후 총점/평균 업데이트
    const updatedGrade = await Score.findOne({
      student_id: student_id,
      year: year,
    });

    const semesters = ["firstSemester", "lastSemester"];
    const terms = ["midterm", "finalterm"];
    const subjects = ["korean", "math", "english", "society", "science"];

    for (const sem of semesters) {
      for (const t of terms) {
        let total = 0;
        let count = 0;

        for (const subj of subjects) {
          const subjScore = updatedGrade[subj];
          if (
            subjScore &&
            subjScore[sem] &&
            subjScore[sem][t] !== null &&
            subjScore[sem][t] !== undefined
          ) {
            const val = Number(subjScore[sem][t]);
            if (!isNaN(val)) {
              total += val;
              count++;
            }
          }
        }

        if (!updatedGrade.total_score) updatedGrade.total_score = {};
        if (!updatedGrade.total_score[sem]) updatedGrade.total_score[sem] = {};
        if (!updatedGrade.average) updatedGrade.average = {};
        if (!updatedGrade.average[sem]) updatedGrade.average[sem] = {};

        if (count === 0) {
          updatedGrade.total_score[sem][t] = null;
          updatedGrade.average[sem][t] = null;
        } else {
          updatedGrade.total_score[sem][t] = total;
          updatedGrade.average[sem][t] = parseFloat((total / count).toFixed(2));
        }
      }
    }
    updatedGrade.markModified("total_score");
    updatedGrade.markModified("average");
    await updatedGrade.save();

    // 성적 수정 메일 전송
    // 성적이 수정된 학생 유저/해당 학생의 학부모의 메일 조회
    const toBeEmail = await User.find({
      linked: student_id,
    }).select("email");

    const _student = await Student.findOne({
      student_id: student_id,
    }).select("name -_id");

    const semesterNumber = semester === "firstSemester" ? 1 : 2;
    const koreanterm = term === "midterm" ? "중간" : "기말";
    const koreanSubject =
      subject === "korean"
        ? "국어"
        : subject === "math"
        ? "수학"
        : subject === "english"
        ? "영어"
        : subject === "society"
        ? "사회"
        : subject === "science"
        ? "과학"
        : null;

    const mailOption = {
      // 해당 선생 이메일로 보내고 싶을 경우
      // from: await User.findOne({ linked: req.session.user.linked[0] }).select("email");
      to: toBeEmail,
      subject: `${_student.name}학생의 ${year}년도 ${semesterNumber}학기 ${koreanterm} ${koreanSubject} 성적 수정이 완료되었습니다.`,
      text: `안녕하세요, ${_student.name} 학생, ${year}년도 ${semesterNumber}학기 ${koreanterm} ${koreanSubject} 성적이 수정되었습니다.`,
      html: `<p>안녕하세요, ${_student.name} 학생 </p><p>${year}년도 ${semesterNumber}학기 ${koreanterm} ${koreanSubject} 성적이 수정되었습니다.</p>`,
    };

    await transporter.sendMail(mailOption);

    return res.status(200).json({
      message: "성적 수정이 완료되었습니다.",
      data: updatedGrade,
    });
  } catch (error) {
    console.error("학생 성적 수정 오류:", error);
    res.status(500).json({ message: "학생 성적 수정 실패", error });

    Sentry.withScope((scope) => {
      scope.setLevel("error");
      scope.setTag("type", "api");
      scope.setTag("api", "modifyStudentGrade");
      Sentry.captureException(error);
    });
  }
});

exports.deleteGrade = asyncHandler(async (req, res) => {
  try {
    const student_id = req.params.student_id;
    const year = req.params.year;
    const subject = req.params.subject;
    const semester = req.params.semester;
    const term = req.params.term;

    // 해당 연도의 해당 학생 성적
    const studentGrade = await Score.findOne({
      student_id: student_id,
      year: year,
    });
    console.log(studentGrade);
    // 성적이 존재하지 않음
    if (!studentGrade) {
      return res.status(400).json({
        message: "해당 연도의 해당 학생 성적이 존재하지 않습니다.",
      });
    }
    if (!studentGrade[subject]) {
      return res.status(400).json({
        message: "해당 과목의 성적이 존재하지 않습니다.",
      });
    }
    if (!studentGrade[subject][semester]) {
      return res.status(400).json({
        message: "해당 학기의 성적이 존재하지 않습니다.",
      });
    }
    if (!studentGrade[subject][semester][term]) {
      return res.status(400).json({
        message: "해당 중간/기말의 성적이 존재하지 않습니다.",
      });
    }
    // 삭제하려는 과목의 학기, 중간/기말 성적 존재
    studentGrade[subject][semester][term] = null;
    studentGrade.markModified(`${subject}.${semester}.${term}`);

    // 먼저 저장
    await studentGrade.save();

    // 그리고 나서 다시 조회
    const updatedGrade = await Score.findOne({ student_id, year });

    const semesters = ["firstSemester", "lastSemester"];
    const terms = ["midterm", "finalterm"];
    const subjects = ["korean", "math", "english", "society", "science"];

    for (const sem of semesters) {
      for (const t of terms) {
        let total = 0;
        let count = 0;

        for (const subj of subjects) {
          const subjScore = updatedGrade[subj];
          if (
            subjScore &&
            subjScore[sem] &&
            subjScore[sem][t] !== null &&
            subjScore[sem][t] !== undefined
          ) {
            const val = Number(subjScore[sem][t]);
            if (!isNaN(val)) {
              total += val;
              count++;
            }
          }
        }

        if (!updatedGrade.total_score) updatedGrade.total_score = {};
        if (!updatedGrade.total_score[sem]) updatedGrade.total_score[sem] = {};
        if (!updatedGrade.average) updatedGrade.average = {};
        if (!updatedGrade.average[sem]) updatedGrade.average[sem] = {};

        if (count === 0) {
          updatedGrade.total_score[sem][t] = null;
          updatedGrade.average[sem][t] = null;
        } else {
          updatedGrade.total_score[sem][t] = total;
          updatedGrade.average[sem][t] = parseFloat((total / count).toFixed(2));
        }
      }
    }
    updatedGrade.markModified("total_score");
    updatedGrade.markModified("average");
    await updatedGrade.save();

    let gradeObj = await Score.findOne({
      student_id: student_id,
      year: year,
    });

    // 저장 전에 모든 성적이 null인지 확인
    // 해당 성적 레코드의 모든 값이 null인지 확인하는 헬퍼 함수
    function isAllScoresNull(gradeDocument) {
      const ignoredKeys = [
        "student_id",
        "teacher_id",
        "class_id",
        "year",
        "_id",
        "__v",
        "total_score",
        "average",
      ];

      for (const subject of Object.keys(gradeDocument._doc)) {
        if (ignoredKeys.includes(subject)) continue;
        const semesters = gradeDocument[subject];
        for (const semester of Object.keys(semesters || {})) {
          const terms = semesters[semester];
          for (const term of Object.keys(terms || {})) {
            if (terms[term] !== null && terms[term] !== undefined) {
              return false;
            }
          }
        }
      }
      return true;
    }

    if (isAllScoresNull(gradeObj)) {
      const deleted = await Score.findOneAndDelete(gradeObj._id);

      return res.status(200).json({
        message:
          "해당 학생의 성적이 모두 null이므로 성적 레코드를 삭제했습니다.",
        deleted: deleted,
      });
    } else {
      return res.status(200).json({
        message: "성적 일부를 null로 수정하였습니다.",
        data: gradeObj,
      });
    }
  } catch (error) {
    console.error("학생 성적 삭제 오류:", error);
    res.status(500).json({ message: "학생 성적 삭제 실패", error });

    Sentry.withScope((scope) => {
      scope.setLevel("error");
      scope.setTag("type", "api");
      scope.setTag("api", "deleteStudentGrade");
      Sentry.captureException(error);
    });
  }
});

exports.createGrade = asyncHandler(async (req, res) => {
  try {
    const student_id = req.params.student_id;
    const year = req.body.year;
    const semester = req.body.semester;
    const term = req.body.term;
    const subject = req.body.subject;
    const score = req.body.score;

    // 필요 데이터 제공되지 않음
    if (!year || !semester || !term || !subject || !score) {
      return res.status(400).json({ message: "필수 데이터를 제공해주세요." });
    }

    // 해당 연도의 해당 학생 성적
    const studentGrade = await Score.findOne({
      student_id: student_id,
      year: year,
    });
    console.log("studentGrade:", studentGrade);
    // 성적이 존재하지 않음. 컬렉션 자체를 새로 생성
    if (!studentGrade) {
      // 학생 조회
      const student = await Student.findOne({ student_id: student_id }).select(
        "class_id class_history"
      );
      console.log("student:", student);

      // classId 목록 생성
      const classIds = [student.class_id, ...(student.class_history || [])];
      console.log("classIds:", classIds);

      // 조건에 맞는 Class 조회
      const selclass = await Class.findOne({
        _id: { $in: classIds },
        year: year,
      });
      console.log("selclass:", selclass);
      // 새로운 성적 생성
      let newGrade = new Score({
        class_id: selclass._id,
        student_id: student_id,
        teacher_id: selclass.teacher_id,
        korean: {
          firstSemester: { midterm: null, finalterm: null },
          lastSemester: { midterm: null, finalterm: null },
        },
        math: {
          firstSemester: { midterm: null, finalterm: null },
          lastSemester: { midterm: null, finalterm: null },
        },
        english: {
          firstSemester: { midterm: null, finalterm: null },
          lastSemester: { midterm: null, finalterm: null },
        },
        society: {
          firstSemester: { midterm: null, finalterm: null },
          lastSemester: { midterm: null, finalterm: null },
        },
        science: {
          firstSemester: { midterm: null, finalterm: null },
          lastSemester: { midterm: null, finalterm: null },
        },
        total_score: {
          firstSemester: { midterm: null, finalterm: null },
          lastSemester: { midterm: null, finalterm: null },
        },
        average: {
          firstSemester: { midterm: null, finalterm: null },
          lastSemester: { midterm: null, finalterm: null },
        },
        year: year,
      });
      await newGrade.save();

      // 성적 입력을 위해 다시 조회
      const againGrade = await Score.findOne({
        student_id: student_id,
        year: year,
      });
      // 성적 입력 후 저장
      againGrade[subject][semester][term] = score;
      againGrade.markModified(`${subject}.${semester}.${term}`);
      await againGrade.save();

      // 다시 조회 후 총점/평균 업데이트
      const _grade = await Score.findOne({
        student_id: student_id,
        year: year,
      });

      // 총점 평균 계산
      const semesters = ["firstSemester", "lastSemester"];
      const terms = ["midterm", "finalterm"];
      const subjects = ["korean", "math", "english", "society", "science"];

      for (const sem of semesters) {
        for (const t of terms) {
          let total = 0;
          let count = 0;

          for (const subj of subjects) {
            const subjScore = _grade[subj];
            if (
              subjScore &&
              subjScore[sem] &&
              subjScore[sem][t] !== null &&
              subjScore[sem][t] !== undefined
            ) {
              const val = Number(subjScore[sem][t]);
              if (!isNaN(val)) {
                total += val;
                count++;
              }
            }
          }

          if (!_grade.total_score) _grade.total_score = {};
          if (!_grade.total_score[sem]) _grade.total_score[sem] = {};
          if (!_grade.average) _grade.average = {};
          if (!_grade.average[sem]) _grade.average[sem] = {};

          if (count === 0) {
            _grade.total_score[sem][t] = null;
            _grade.average[sem][t] = null;
          } else {
            _grade.total_score[sem][t] = total;
            _grade.average[sem][t] = parseFloat((total / count).toFixed(2));
          }
        }
      }
      _grade.markModified("total_score");
      _grade.markModified("average");
      await _grade.save();

      return res.status(200).json({
        message: "성적 생성이 완료되었습니다.",
        data: _grade,
      });
    } else {
      // 성적 컬렉션이 존재함
      // 생성하고자 하는 과목의 학기, 중간/기말 성적 존재
      if (studentGrade[subject][semester][term] !== null) {
        return res.status(400).json({
          message: "해당 과목의 성적이 이미 존재합니다.",
        });
      }
      // 새로운 성적 생성
      studentGrade[subject][semester][term] = score;
      studentGrade.markModified(`${subject}.${semester}.${term}`);
      await studentGrade.save();

      // 다시 조회 후 총점/평균 업데이트
      const _grade = await Score.findOne({
        student_id: student_id,
        year: year,
      });

      // 총점 평균 계산
      const semesters = ["firstSemester", "lastSemester"];
      const terms = ["midterm", "finalterm"];
      const subjects = ["korean", "math", "english", "society", "science"];

      for (const sem of semesters) {
        for (const t of terms) {
          let total = 0;
          let count = 0;

          for (const subj of subjects) {
            const subjScore = _grade[subj];
            if (
              subjScore &&
              subjScore[sem] &&
              subjScore[sem][t] !== null &&
              subjScore[sem][t] !== undefined
            ) {
              const val = Number(subjScore[sem][t]);
              if (!isNaN(val)) {
                total += val;
                count++;
              }
            }
          }

          if (!_grade.total_score) _grade.total_score = {};
          if (!_grade.total_score[sem]) _grade.total_score[sem] = {};
          if (!_grade.average) _grade.average = {};
          if (!_grade.average[sem]) _grade.average[sem] = {};

          if (count === 0) {
            _grade.total_score[sem][t] = null;
            _grade.average[sem][t] = null;
          } else {
            _grade.total_score[sem][t] = total;
            _grade.average[sem][t] = parseFloat((total / count).toFixed(2));
          }
        }
      }
      _grade.markModified("total_score");
      _grade.markModified("average");
      await _grade.save();

      return res.status(200).json({
        message: "성적 생성이 완료되었습니다.",
        data: _grade,
      });
    }
  } catch (error) {
    console.error("학생 성적 생성 오류:", error);
    res.status(500).json({ message: "학생 성적 생성 실패", error });

    Sentry.withScope((scope) => {
      scope.setLevel("error");
      scope.setTag("type", "api");
      scope.setTag("api", "createStudentGrade");
      Sentry.captureException(error);
    });
  }
});
