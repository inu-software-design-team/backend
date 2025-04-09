# COSY

이 프로젝트는 MongoDB와 관련된 설정 및 Express 서버와의 연동을 다루고 있습니다. MongoDB Atlas와 Compass를 사용하여 GUI로 데이터를 관리하고 서버와 연동하는 방법을 정리하였습니다.

## 1. MongoDB Atlas 설정

### 🛠️ **MongoDB Atlas 계정 생성**

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) 웹사이트에 접속하여 계정을 생성합니다.

2. **Database Access**:

   - MongoDB Atlas에서 **Database Access**를 설정하여 `root` 사용자 계정과 비밀번호를 설정합니다.
   - MongoDB Atlas에서 `IP Whitelist`를 추가하여 서버나 로컬에서 접근할 수 있도록 허용합니다. (일반적으로 `0.0.0.0/0`을 추가하여 모든 IP에서 접근 가능)

3. **MongoDB URI 가져오기**:

   - MongoDB Atlas 대시보드에서 **Connect** 버튼을 클릭하여 **Connect Your Application**을 선택합니다.
   - MongoDB URI를 복사하여 `.env` 파일에 추가합니다.
