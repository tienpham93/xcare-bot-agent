# Application diagram
![Application Diagram](../assets/chatbot_diagram.png)

# What to test
![Test Levels Diagram](../assets/test_levels.jpg)

1. Static testing on provided knowledge, business requirements and codebase
    - To find out any likelihood of missmatch, miss config, existing bias in knowledge base or unreasonable requires at early stage 
2. Based on provided knowledge and business requirements
    - Component integration tests
    - System tests
3. Other tests
    - Security tests: check to see if the LLM agent expose or receive sensitive data
    - Engage with analytic team to improve test suite

## Automation
The regression test suite of Component integration tests and System tests
These tests will check the response ability of the agent base on the provided knowledge

### Pre-condition
Must start the server by this following command:
```sh
yarn start
```

### Run all tests
Run the following command:
```sh
yarn test
```

### Open the GUI model
Run the following command:
```sh
yarn test:gui
```