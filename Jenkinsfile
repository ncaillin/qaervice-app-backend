pipeline {
  agent any
  options {
  buildDiscarder(logRotator(numToKeepStr: '5'))
  }
  environment {
  CANISTER_CREDENTIALS = credentials('canisterIO')
  }
  stages {
    stage('Build') {
      steps {
        app = docker.build("qaervice/qaervice-backend")
      }
    }
    stage('Login') {
      steps {
        sh 'echo login2'
      }
    }
    stage('Push') {
      steps {
        sh 'echo Push'
      }
    }
  }
  post {
    always {
      sh 'echo post'
    }
  }
}
