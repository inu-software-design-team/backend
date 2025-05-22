const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const Class = require("../models/Class");
const Score = require("../models/Score");
const Parent = require("../models/Parent");
const StudentRecord = require("../models/StudentRecord");
const Attendance = require("../models/Attendance");
const Remark = require("../models/Remark");
const Sentry = require("@sentry/node");

// 인적사항 조회 api
exports.fetchInformation = asyncHandler(async (req, res) => {
  const studentId = req.params.student_id;
  console.log(studentId);

  try {
    //연결된 학생 찾기
    const student = await Student.findOne({
      student_id: studentId,
    }).populate({
      path: "class_id", // 1단계: class 문서
      populate: {
        path: "teacher", // 2단계: class 내부의 teacher_id 필드
        model: "Teacher",
      },
    });

    // 연결된 사용자(학생 역할)를 찾기
    const user = await User.findOne({
      linked: studentId,
      role: "student",
    });

    //연결된 학부모 찾기
    const parents = await Parent.find({
      child_id: { $in: [studentId] },
    });

    if (!student) {
      return res.status(404).json({ message: "학생을 찾을 수 없습니다." });
    }

    const responseData = {
      student_id: student.student_id,
      name: student.name,
      gender: student.gender,
      registration_number: student.registration_number,
      class: {
        teacher_name: student.class_id?.teacher?.name || null,
        grade: student.class_id?.grade || null,
        class: student.class_id?.class || null,
        year: student.class_id?.year || null,
      },
      parents: parents.map((p) => ({
        name: p.name,
        gender: p.gender,
        phone: p.phone,
        occupation: p.occupation,
      })),
    };

    // 유저 정보가 있으면 address와 phone 추가
    if (user) {
      responseData.address = user.address;
      responseData.phone = user.phone;
    }

    console.log(responseData);

    res.status(200).json(responseData);
  } catch (error) {
    console.error("학생 목록 오류:", error);
    res.status(500).json({ message: "학생 목록 불러오기 실패", error });

    Sentry.withScope((scope) => {
      scope.setLevel("error");
      scope.setTag("type", "api");
      scope.setTag("api", "checkFetchInformation");
      Sentry.captureException(error);
    });
  }
});

// 인적사항 수정 api
exports.modifyInformation = asyncHandler(async (req, res) => {
  const studentId = req.params.student_id;
  const { gender, registration_number, phone_number, address } = req.body;

  try {
    // 학생 존재 여부 확인
    const student = await Student.findOne({ student_id: studentId });
    if (!student) {
      return res.status(404).json({ message: "학생을 찾을 수 없습니다." });
    }

    console.log(student);

    // 인적사항 수정
    if (gender !== undefined) student.gender = gender;
    if (registration_number !== undefined)
      student.registration_number = registration_number;

    // 연결된 사용자(학생 역할)를 찾기
    const user = await User.findOne({
      linked: studentId,
      role: "student",
    });

    // if (!user) {
    //   return res.status(404).json({ message: "학생을 찾을 수 없습니다." });
    // }

    // 주소와 휴대폰 번호 수정
    if (user && address !== undefined) {
      user.address = address;
      user.phone = phone_number;
      await user.save();
    }

    await student.save();

    console.log(user);

    res
      .status(200)
      .json({ message: "학생 및 사용자 정보가 성공적으로 수정되었습니다." });
  } catch (error) {
    console.error("학생 정보 수정 오류:", error);

    Sentry.withScope((scope) => {
      scope.setLevel("error");
      scope.setTag("type", "api");
      scope.setTag("api", "modifyInformation");
      Sentry.captureException(error);
    });

    res.status(500).json({ message: "학생 정보 수정 실패", error });
  }
});

// 이름 수정 api
exports.modifyName = asyncHandler(async (req, res) => {
  const studentId = req.params.student_id;
  const { name } = req.body;

  try {
    // 학생 존재 여부 확인
    const student = await Student.findOne({ student_id: studentId });
    if (!student) {
      return res.status(404).json({ message: "학생을 찾을 수 없습니다." });
    }

    console.log(student);

    // 인적사항 수정
    if (name !== undefined) student.name = name;

    await student.save();

    res.status(200).json({ message: "이름 정보가 성공적으로 수정되었습니다." });
  } catch (error) {
    console.error("이름름 정보 수정 오류:", error);

    Sentry.withScope((scope) => {
      scope.setLevel("error");
      scope.setTag("type", "api");
      scope.setTag("api", "modifyName");
      Sentry.captureException(error);
    });

    res.status(500).json({ message: "이름 정보 수정 실패", error });
  }
});

///////////////////////////////////////////////

//출석부 조회
exports.fetchAttendance = asyncHandler(async (req, res) => {
  const studentId = req.params.student_id;
  console.log(studentId);

  try {
    //연결된 학생 출석 찾기
    const attendance = await StudentRecord.findOne({
      student_id: studentId,
    }).populate({
      path: "attendance_id", // 1단계: attendance 문서
    });

    if (!attendance) {
      return res.status(404).json({ message: "학생 출석을 찾을 수 없습니다." });
    }

    // 응답 데이터 구성
    const responseData = {
      student_id: attendance.student_id,
      attendance: attendance.attendance_id,
    };

    console.log(responseData);

    res.status(200).json(responseData);
  } catch (error) {
    console.error("학생 출석 목록 오류:", error);
    res.status(500).json({ message: "학생 출석목록 불러오기 실패", error });

    Sentry.withScope((scope) => {
      scope.setLevel("error");
      scope.setTag("type", "api");
      scope.setTag("api", "fetchAttendance");
      Sentry.captureException(error);
    });
  }
});

// 출석부 추가
exports.addAttendance = asyncHandler(async (req, res) => {
  const studentId = req.params.student_id;
  const attendanceInformation = req.body;
  // 날짜 형식을 ISO 형식으로 변환
  if (attendanceInformation.date) {
    attendanceInformation.date = new Date(attendanceInformation.date); // → Date 객체로 변환됨
  }

  try {
    // 출석 생성
    const newAttendance = await Attendance.create(attendanceInformation);

    // 학생 레코드에 출석 ID 연결
    const studentRecord = await StudentRecord.findOne({
      student_id: studentId,
    });
    if (!studentRecord) {
      return res.status(404).json({ message: "학생 기록을 찾을 수 없습니다." });
    }

    // 출석 ID 추가 (배열 형태라면 push, 단일 필드라면 교체)
    studentRecord.attendance_id.push(newAttendance._id);
    await studentRecord.save();

    res.status(201).json({
      message: "출석 추가 성공",
      attendance: newAttendance,
    });
  } catch (error) {
    console.error("출석 추가 오류:", error);
    res.status(500).json({ message: "출석 추가 실패", error });

    Sentry.withScope((scope) => {
      scope.setLevel("error");
      scope.setTag("type", "api");
      scope.setTag("api", "addAttendance");
      Sentry.captureException(error);
    });
  }
});

// 출석부 수정
exports.patchAttendance = asyncHandler(async (req, res) => {
  const attendanceId = req.params.student_id;
  const updatedData = req.body;
  // 날짜 형식을 ISO 형식으로 변환
  if (updatedData.date) {
    updatedData.date = new Date(updatedData.date); // → Date 객체로 변환됨
  }

  try {
    // 출석 데이터 업데이트
    const updatedAttendance = await Attendance.findByIdAndUpdate(
      attendanceId,
      updatedData,
      { new: true } // 업데이트 후의 문서를 반환
    );

    if (!updatedAttendance) {
      return res
        .status(404)
        .json({ message: "해당 출석 정보를 찾을 수 없습니다." });
    }

    res.status(200).json({
      message: "출석 수정 성공",
      attendance: updatedAttendance,
    });
  } catch (error) {
    console.error("출석 수정 오류:", error);
    res.status(500).json({ message: "출석 수정 실패", error });

    Sentry.withScope((scope) => {
      scope.setLevel("error");
      scope.setTag("type", "api");
      scope.setTag("api", "patchAttendance");
      Sentry.captureException(error);
    });
  }
});

//출석부 삭제
exports.deleteAttendance = asyncHandler(async (req, res) => {
  const attendanceId = req.params.student_id;
  console.log(attendanceId);

  try {
    //연결된 학생 출석 찾기
    const attendance = await Attendance.findOne({
      _id: attendanceId,
    });

    console.log(attendance);

    if (!attendance) {
      return res.status(404).json({ message: "해당 출석을 찾을 수 없습니다." });
    }

    // 참조하는 학생 레코드에서 삭제
    await StudentRecord.updateMany(
      { attendance_id: attendanceId },
      { $pull: { attendance_id: attendanceId } }
    );

    // 출석 문서 삭제
    await Attendance.deleteOne({ _id: attendanceId });

    res.status(200).json({ message: "출석 삭제 성공" });
  } catch (error) {
    console.error("학생 출석 목록 오류:", error);
    res.status(500).json({ message: "학생 출석 삭제 실패", error });

    Sentry.withScope((scope) => {
      scope.setLevel("error");
      scope.setTag("type", "api");
      scope.setTag("api", "deleteAttendance");
      Sentry.captureException(error);
    });
  }
});

///////////////////////////////////////////////

//특기사항 조회
exports.fetchRemark = asyncHandler(async (req, res) => {
  const studentId = req.params.student_id;
  console.log(studentId);

  try {
    //연결된 학생 특이사항 찾기
    const remark = await StudentRecord.findOne({
      student_id: studentId,
    }).populate({
      path: "remarks_id",
      populate: {
        path: "teacher",
        select: "name -_id",
      },
    });

    if (!remark) {
      return res
        .status(404)
        .json({ message: "학생 특기사항을 찾을 수 없습니다." });
    }

    // 응답 데이터 구성
    const responseData = {
      student_id: remark.student_id,
      remarks: remark.remarks_id,
    };

    console.log(responseData);

    res.status(200).json(responseData);
  } catch (error) {
    console.error("학생 특기사항 목록 오류:", error);
    res.status(500).json({ message: "학생 특기사항목록 불러오기 실패", error });

    Sentry.withScope((scope) => {
      scope.setLevel("error");
      scope.setTag("type", "api");
      scope.setTag("api", "fetchRemark");
      Sentry.captureException(error);
    });
  }
});

// 특기사항 추가
exports.addRemark = asyncHandler(async (req, res) => {
  const studentId = req.params.student_id;
  const remarkInformation = req.body;
  // 날짜 형식을 ISO 형식으로 변환
  if (remarkInformation.date) {
    remarkInformation.date = new Date(remarkInformation.date); // → Date 객체로 변환됨
  }

  try {
    // 출석 생성
    const newRemark = await Remark.create(remarkInformation);

    // 학생 레코드에 출석 ID 연결
    const studentRecord = await StudentRecord.findOne({
      student_id: studentId,
    });
    if (!studentRecord) {
      return res.status(404).json({ message: "학생 기록을 찾을 수 없습니다." });
    }

    // 출석 ID 추가 (배열 형태라면 push, 단일 필드라면 교체)
    studentRecord.remarks_id.push(newRemark._id);
    await studentRecord.save();

    res.status(201).json({
      message: "특이사항 추가 성공",
      remark: newRemark,
    });
  } catch (error) {
    console.error("출석 추가 오류:", error);
    res.status(500).json({ message: "특이사항 추가 실패", error });

    Sentry.withScope((scope) => {
      scope.setLevel("error");
      scope.setTag("type", "api");
      scope.setTag("api", "addRemark");
      Sentry.captureException(error);
    });
  }
});

// 특기사항 수정
exports.patchRemark = asyncHandler(async (req, res) => {
  const remarkId = req.params.student_id;
  const updatedData = req.body;
  // 날짜 형식을 ISO 형식으로 변환
  if (updatedData.date) {
    updatedData.date = new Date(updatedData.date); // → Date 객체로 변환됨
  }

  try {
    // 출석 데이터 업데이트
    const updatedRemark = await Remark.findByIdAndUpdate(
      remarkId,
      updatedData,
      { new: true } // 업데이트 후의 문서를 반환
    );

    if (!updatedRemark) {
      return res
        .status(404)
        .json({ message: "해당 특기사항 정보를 찾을 수 없습니다." });
    }

    res.status(200).json({
      message: "특기사항 수정 성공",
      remark: updatedRemark,
    });
  } catch (error) {
    console.error("특기사항 수정 오류:", error);
    res.status(500).json({ message: "특기사항 수정 실패", error });

    Sentry.withScope((scope) => {
      scope.setLevel("error");
      scope.setTag("type", "api");
      scope.setTag("api", "patchRemark");
      Sentry.captureException(error);
    });
  }
});

//특가시항 삭제
exports.deleteRemark = asyncHandler(async (req, res) => {
  const remarkId = req.params.student_id;
  console.log(remarkId);

  try {
    //연결된 학생 출석 찾기
    const remark = await Remark.findOne({
      _id: remarkId,
    });

    console.log(remark);

    if (!remark) {
      return res
        .status(404)
        .json({ message: "해당 특기사항을 찾을 수 없습니다." });
    }

    // 참조하는 학생 레코드에서 삭제
    await StudentRecord.updateMany(
      { remarks_id: remarkId },
      { $pull: { remarks_id: remarkId } }
    );

    // 출석 문서 삭제
    await Remark.deleteOne({ _id: remarkId });

    res.status(200).json({ message: "특기사항 삭제 성공" });
  } catch (error) {
    console.error("학생 특기사항 삭제 오류:", error);
    res.status(500).json({ message: "학생 특기사항 삭제 실패", error });

    Sentry.withScope((scope) => {
      scope.setLevel("error");
      scope.setTag("type", "api");
      scope.setTag("api", "deleteRemark");
      Sentry.captureException(error);
    });
  }
});
