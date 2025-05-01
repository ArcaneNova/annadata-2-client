pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-creds')  // Docker Hub credentials in Jenkins
    }

    stages {
        stage('Clean Workspace') {
            steps {
                cleanWs()
            }
        }

        stage('Checkout Code') {
            steps {
                git url: 'https://github.com/ArcaneNova/annadata-2-client', branch: 'main'
            }
        }

        stage('Install & Build with Vite (Docker)') {
            steps {
                script {
                    docker.image('node:18-alpine').inside {
                        sh 'npm install'
                        sh 'npm run build'  // Assumes Vite is configured and "build" is defined in package.json
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    // Dockerfile should be configured to serve Vite build (e.g., using Nginx or serve)
                    sh 'docker build -t arshadnoor585/annadata-client:latest .'
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                        sh 'echo $DOCKER_PASSWORD | docker login --username $DOCKER_USERNAME --password-stdin'
                        sh 'docker push arshadnoor585/annadata-client:latest'
                    }
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}
