/**
 * @swagger
 * /api/v1/users/sign-up:
 *   post:
 *     tags: [User]
 *     summary: 회원가입
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - role
 *               - number
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: yourStrongPassword123
 *               role:
 *                 type: string
 *                 enum: [student, teacher, parent]
 *                 example: student
 *               number:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [10001]
 *     responses:
 *       200:
 *         description: 회원가입 성공
 *       500:
 *         description: 서버 오류
 */

/**
 * @swagger
 * /api/v1/users/login:
 *   post:
 *     tags: [User]
 *     summary: 로그인
 *     description: |
 *       로그인 시 CSRF 보호를 위해 `X-CSRF-Token` 헤더에 토큰을 포함하고,
 *       세션 유지를 위해 `withCredentials: true` 옵션을 사용해야 합니다.
 *
 *       ⚠️ Swagger UI에서는 withCredentials 설정이 불가능하므로,
 *       실제 테스트는 Postman 또는 브라우저 기반 클라이언트에서 수행하세요.
 *
 *       예시 (axios):
 *       ```js
 *       const { data } = await axios.get("/api/v1/users/csrf-token", {
 *         withCredentials: true, // 세션 쿠키 포함
 *       });
 *       const csrfToken = data.csrfToken;
 *
 *       await axios.post("/api/v1/users/login", {
 *         email: "user@example.com",
 *         password: "yourPassword123",
 *       }, {
 *         withCredentials: true, // 세션 유지
 *         headers: {
 *           "X-CSRF-Token": csrfToken, // CSRF 토큰 포함
 *         },
 *       });
 *       ```
 *     parameters:
 *       - in: header
 *         name: X-CSRF-Token
 *         required: true
 *         schema:
 *           type: string
 *         description: 발급받은 CSRF 토큰을 헤더에 포함하세요.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: 로그인 성공
 *       401:
 *         description: 인증 실패
 */

/**
 * @swagger
 * /api/v1/users/check-id:
 *   get:
 *     tags: [User]
 *     summary: 역할 인증
 *     description: |
 *       회원가입 전, 역할(role), 번호(number), 이름(name)을 기반으로
 *       교사 / 학생 / 학부모 여부를 인증합니다.
 *       `학번,교번 등을 배열로 전해줘야합니다!!!`
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *               - number
 *               - name
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [student, teacher, parent]
 *                 example: student
 *               number:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [10001]
 *               name:
 *                 type: string
 *                 example: 홍길동
 *     responses:
 *       200:
 *         description: 인증 성공
 *       400:
 *         description: 잘못된 요청 또는 일치하는 정보 없음
 *       500:
 *         description: 서버 오류
 */
/**
 * @swagger
 * /api/v1/users/csrf-token:
 *   get:
 *     tags: [User]
 *     summary: CSRF 토큰 발급
 *     description: |
 *       세션 유지를 위해 `withCredentials: true` 옵션을 사용해야 합니다.
 *     responses:
 *       200:
 *         description: CSRF 토큰 발급 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 csrfToken:
 *                   type: string
 *                   description: 발급된 CSRF 토큰
 */

/**
 * @swagger
 * /api/v1/users/session-check:
 *   get:
 *     tags: [User]
 *     summary: 세션 확인
 *     description: 현재 사용자의 세션 정보를 반환합니다.
 *     responses:
 *       200:
 *         description: 세션 정보 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 session:
 *                   type: object
 *                   description: 세션 정보
 */
