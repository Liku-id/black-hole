import groovy.json.JsonOutput
pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY_URL = 'http://172.16.0.8:5000/wukong'
        DOCKER_REGISTRY = 'registry-prem.eku.id/wukong'
        DOCKER_IMAGE = 'black-hole'
        REGISTRY = 'wukong'
        KUBECONFIG = credentials('kubeconfig-wukong-staging')
        DEPLOYMENT_FILE = "./deployment/deployment.yaml"
        IMAGE_PULL_SECRET = 'private-repository'
        LARK_ID = credentials('lark-id')
        GIT_SSH_COMMAND = 'ssh -o StrictHostKeyChecking=no'
    }

    stages {
        stage('Clone Repository') {
            steps {
              checkout([
                $class: 'GitSCM',
                branches: [[name: '*/develop']],
                userRemoteConfigs: [[
                  url: 'git@github.com:Liku-id/black-hole.git',
                  credentialsId: 'github-keys'
                ]],
                extensions: [
                  [$class: 'SubmoduleOption',
                    recursiveSubmodules: true,
                    trackingSubmodules: false,
                    parentCredentials: true
                  ]
                ]
              ])
            }
        }
        stage('Build Docker Image') {
            steps {
                script {
                    def GIT_SHOW = sh(returnStdout: true, script: 'git show').trim()
                    def escapedGitShow = JsonOutput.toJson(GIT_SHOW).replaceAll(/^"|"$|'/, "")
                    echo escapedGitShow
                    sh"""
                    curl -X POST -H "Content-Type: application/json" \
                    -d '{"msg_type":"text","content":{"text":"[BLACK HOLE BUILD STARTED] - ${escapedGitShow}"}}' \
                    https://open.larksuite.com/open-apis/bot/v2/hook/${LARK_ID}
                    """
                    sh "ls -l"
                    def commit = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                    def tag = "${REGISTRY}/${DOCKER_IMAGE}:${commit}"
                    echo "Building Docker image with tag: ${tag}"
                    sh "docker build --no-cache -f ./staging.dockerfile -t ${tag} ."
                }
            }
        }

        stage('Push to Registry') {
            steps {
                script {
                    docker.withRegistry(DOCKER_REGISTRY_URL, 'docker-login') {
                        def commit = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                        docker.image("${REGISTRY}/${DOCKER_IMAGE}:${commit}").push()
                    }
                }
            }
        }
        stage('Update Kubernetes Images') {
            steps {
                script {
                    def commit = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                    def newImage = "${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${commit}"
                    sh "sed -i 's|image: .*|image: ${newImage}|' ${DEPLOYMENT_FILE}"
                }
            }
        }
        stage('Apply kubernetes config') {
            steps {
                script {
                    sh "kubectl apply -f ${DEPLOYMENT_FILE}"
                }
            }
        }
        stage('Lark notification') {
            steps {
                script {
                    sh """
                    curl -X POST -H "Content-Type: application/json" \
                    -d '{"msg_type":"text","content":{"text":"BLACK HOLE build success, please wait 1 minute for restarting server"}}' \
                    https://open.larksuite.com/open-apis/bot/v2/hook/${LARK_ID}
                    """
                }
            }
        }
        stage('Discard git changes') {
            steps {
                script {
                    sh "git clean -df"
                    sh "git checkout -- ."
                }
            }
        }
    }
    post { 
        failure { 
            echo 'failure'
            sh """
            curl -X POST -H "Content-Type: application/json" \
            -d '{"msg_type":"text","content":{"text":"BLACK HOLE build failure"}}' \
            https://open.larksuite.com/open-apis/bot/v2/hook/${LARK_ID}
            """
        }
    }
}