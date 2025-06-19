pipeline {
    agent any

    environment {
        BACKEND_DIR = 'backend/MMartHandMade/MMartHandMade'
        FRONTEND_DIR = 'frontend/MartHandMade'
        DB_SCRIPT = 'database/init.sql'
        FRONTEND_DEST = 'C:\\wwwroot\\HandMadeMart_02_UI'
        BACKEND_DEST = 'C:\\wwwroot\\HandMadeMart_02_API'
        CSPROJ_FILE = 'MMartHandMade.csproj'
    }

    stages {
        stage('Clone Source Code') {
            steps {
                echo '📥 Cloning source code...'
                git branch: 'main', url: 'https://github.com/ZuyAnhIT/HandMadeMart_02.git'
            }
        }

        stage('Build Backend API') {
            steps {
                dir("${BACKEND_DIR}") {
                    echo '🔧 Building ASP.NET API...'
                    bat "dotnet restore ${CSPROJ_FILE}"
                    bat "dotnet build ${CSPROJ_FILE} --configuration Release"
                    bat "dotnet publish ${CSPROJ_FILE} -c Release -o ../../../publish-api"
                }
            }
        }

        stage('Deploy Frontend to IIS') {
            steps {
                echo '🌐 Deploying frontend...'
                bat """
                    iisreset /stop
                    if exist "${FRONTEND_DEST}" rd /S /Q "${FRONTEND_DEST}"
                    mkdir "${FRONTEND_DEST}"
                    xcopy "${FRONTEND_DIR}\\*" "${FRONTEND_DEST}" /E /I /Y
                """
            }
        }

        stage('Deploy Backend API to IIS') {
            steps {
                echo '🚀 Deploying backend...'
                bat """
                    if exist "${BACKEND_DEST}" rd /S /Q "${BACKEND_DEST}"
                    mkdir "${BACKEND_DEST}"
                    xcopy "publish-api\\*" "${BACKEND_DEST}" /E /I /Y
                    iisreset /start
                """
            }
        }

        stage('Init Database') {
            steps {
                echo '🗃️ Running DB script if exists...'
                powershell """
                    if (Test-Path '${DB_SCRIPT}') {
                        sqlcmd -S .\\SQLEXPRESS -i '${DB_SCRIPT}'
                    } else {
                        Write-Output '❗ DB script not found, skipping.'
                    }
                """
            }
        }

        stage('✅ Done') {
            steps {
                echo '🎉 CI/CD pipeline hoàn tất!'
            }
        }
    }
}
