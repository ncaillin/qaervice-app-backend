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
        sh 'echo building'
      }
    }
    stage('Login') {
      steps {
        sh 'echo login'
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
