// swagger.js
const swaggerJSDoc = require("swagger-jsdoc");
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "학생부 성적 관리 API",
      version: "1.0.0",
      description: "학생, 학부모, 교사용 API 문서",
    },
    servers: [
      {
        url: "http://localhost:4000", // 실제 배포 서버 주소로 나중에 교체
      },
    ],
  },
  apis: ["./swagger/docs/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
