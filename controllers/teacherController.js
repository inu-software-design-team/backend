const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const Class = require("../models/Class");
const Score = require("../models/Score");
const transporter = require("../config/mailConfig");
const Sentry = require("@sentry/node");

// 성적/교사 탭 학생 목록 api
exports.checkAll = asyncHandler(async (req, res) => {
  try {
    // 세션이 존재하지 않음
    if (!req.session || !req.session.user) {
      return res
        .status(400)
        .json({ message: "세션이 존재하지 않음/로그인 되어있지 않음" });
    }
    // 세션 만료됨
    if (new Date(req.session.cookie.expires) < new Date()) {
      return res.status(400).json({ message: "세션이 만료됨" });
    }
    // 세션 존재 및 유효
    // 조회하고자 하는 연도
    const selYear = req.body.year;
    // 조회 년도 누락 -> 현재 연도로 조회
    if (!selYear) {
      selYear = 2025;
    }

    // 현재 로그인되어 있는 선생님
    const curteacher = await Teacher.findOne({
      teacher_id: req.session.user.linked[0],
    });

    // 조회하고자 하는 학급
    const targetClass = await Class.findOne({
      teacher_id: curteacher.teacher_id,
      year: selYear,
    });

    console.log(targetClass);

    // 학급 학생들 모두 조회
    let students = await Student.find({
      $or: [
        { class_id: targetClass._id },
        { class_history: { $in: [targetClass._id] } },
      ],
    })
      .select("name student_id")
      .populate("class_id", "grade class");

    console.log(students);

    return res.status(200).json({
      message: "현재 교사의 선택한 연도의 학급, 학급 학생들 정보입니다.",
      data: {
        class_id: targetClass._id, // 조회하고자 하는 학급 id(이후 특정 학생 성적 조회에 사용할때 req.body에 담아서 요청해야함)
        grade: targetClass.grade, // 학년
        class: targetClass.class, // 반
        studentsList: students, // 학생들의 objectId/학번/이름
      },
    });
  } catch (error) {
    console.error("학생 목록 오류:", error);
    res.status(500).json({ message: "학생 목록 불러오기 실패", error });

    Sentry.withScope((scope) => {
      scope.setLevel("error");
      scope.setTag("type", "api");
      scope.setTag("api", "checkAllStudents");
      Sentry.captureException(error);
    });
  }
});

// 성적/교사 탭 특정 학생 성적 조회 api
exports.checkGrade = asyncHandler(async (req, res) => {
  try {
    const student_id = req.params.student_id;
    // 조회하고자 하는 연도
    const year = req.body.year;
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
    const year = req.body.year;
    const subject = req.body.subject;
    const semester = req.body.semester;
    const term = req.body.term;

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
    // 과목 리스트
    const subjects = ["korean", "math", "english", "society", "science"];

    let total = 0;
    let count = 0;

    for (const subj of subjects) {
      const subjScore = studentGrade[subj];
      if (
        subjScore &&
        subjScore[semester] &&
        typeof subjScore[semester][term] === "number"
      ) {
        const val = subjScore[semester][term];
        if (!isNaN(val)) {
          total += val;
          count++;
        }
      }
    }

    // 해당 semester + term 기준으로 total_score / average 계산 후 저장
    if (!studentGrade.total_score) studentGrade.total_score = {};
    if (!studentGrade.total_score[semester])
      studentGrade.total_score[semester] = {};
    studentGrade.total_score[semester][term] = total;

    if (!studentGrade.average) studentGrade.average = {};
    if (!studentGrade.average[semester]) studentGrade.average[semester] = {};
    studentGrade.average[semester][term] =
      count > 0 ? parseFloat((total / count).toFixed(2)) : null;
    // 성적 저장
    await studentGrade.save();
    // 저장 전에 모든 성적이 null인지 확인
    const gradeObj = studentGrade.toObject();
    // 해당 성적 레코드의 모든 값이 null인지 확인하는 헬퍼 함수
    function isAllScoresNull(gradeObject) {
      for (const subject of Object.keys(gradeObject)) {
        if (
          [
            "student_id",
            "year",
            "_id",
            "__v",
            "total_score",
            "average",
          ].includes(subject)
        )
          continue;
        const semesters = gradeObject[subject];
        for (const semester of Object.keys(semesters)) {
          const terms = semesters[semester];
          for (const term of Object.keys(terms)) {
            if (terms[term] !== null && terms[term] !== undefined) {
              return false;
            }
          }
        }
      }
      return true;
    }
    if (isAllScoresNull(gradeObj)) {
      await Score.deleteOne({ _id: studentGrade._id });
      return res.status(200).json({
        message:
          "해당 학생의 성적이 모두 null이므로 성적 레코드를 삭제했습니다.",
      });
    } else {
      studentGrade.markModified("total_score");
      studentGrade.markModified("average");
      await studentGrade.save();
      return res.status(200).json({
        message: "성적 일부를 null로 수정하였습니다.",
        data: studentGrade,
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
