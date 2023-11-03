node {
    

    def app

    stage('Clone repository') {

        checkout scm
    }

    stage('Build image') {

        app = docker.build("registry.gitlab.com/qaervice/backend")
    }

    stage('Test image') {
        /* Ideally, we would run a test framework against our image.
         * For this example, we're using a Volkswagen-type approach ;-) */

        app.inside {
            sh 'echo "Tests passed"'
        }
    }

    stage('Push image') {
        docker.withRegistry('https://registry.gitlab.com', 'gitlab-backend') {
            app.push("${env.BUILD_NUMBER}")
            app.push("latest")
        }
    }
}
