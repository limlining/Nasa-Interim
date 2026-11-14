# GROUP NAME: A++
MEMBER:

1.LIM LI NING

2.LIM LI JING

3.YAP YING YI

4.NG XUAN YEE


# PROJECT NAME: INTERIM
### Astronaut Health Assessment and Decision-Making Simulator

**Making health decisions when communication with Earth is delayed.**

[LiveDemo](https://limlining.github.io/Nasa-Interim/) 

[Youtube link](https://youtu.be/e07wOKfYuDE?si=j7b7R1dpowJ64uDZ)

[Presentation Slide](https://github.com/limlining/Nasa-Interim/blob/main/INTERIM_Slide_Demo_Team%20A%2B%2B.pdf)

[GitHub Repository](https://github.com/limlining/Nasa-Interim)

---

## 1. About the Project

INTERIM is a web-based simulation platform developed for the **2026 NASA International Space Apps Challenge**.

The project focuses on the health-related challenges astronauts may face during space missions, particularly during and after Extravehicular Activities (EVA), also known as spacewalks.

Unexpected health conditions can affect astronauts when working in space as it is not always possible to obtain immediate medical care in that setting. Astronauts cannot easily obtain directions from their counterparts on the ground due to delays in communication.

INTERIM enables users to go through various experiences related to medical emergencies for astronauts with delay in or lack of communication from the ground.

In doing so, the platform hopes to enable users to grasp the significance of being aware of health issues and acting upon them.

## 2. Background and Problem Statement

Astronauts working in space face an environment which is radically different from that on Earth. The effects of factors like change in gravity, radiation exposure, and isolation could impact their physical and psychological well-being.

These factors become even more important for astronauts who go out of the vehicle in order to conduct Extravehicular Activity (EVA). In an EVA, astronauts perform the assigned task outside the spaceship wearing spacesuits. Any unexpected symptom or problem needs immediate attention while conducting EVA.

The astronauts do not always have access to medical assistance from the doctors present on Earth. Delay or interruption in communication could have an impact on getting advice from the doctors on Earth.

In such scenarios, the astronauts will have to analyze the problem faced by them and the urgency involved in the issue before taking any action.

**The main problem addressed by INTERIM is how astronauts can make timely and appropriate health-related decisions when immediate communication with ground-based medical support is limited.**

## 3. Our Solution

INTERIM provides a scenario-based simulation where users take the role of an astronaut facing different health-related situations.

Users are given information about the astronaut's condition and must choose an action based on the situation. The simulation introduces communication delays and blackout conditions to demonstrate what may happen when ground support is not immediately available.

After making a decision, users receive feedback by comparing their response with the simulated ground recommendation.

The system also records completed scenarios so users can review their previous decisions and performance.

Rather than providing medical diagnosis, INTERIM focuses on decision-making, response time and awareness of astronaut health concerns.

## 4. Target Users

### Primary Target Users: EVA Astronauts

INTERIM is based mainly on the astronaut's requirements during Extravehicular Activity (EVA).

During the EVA and after, astronauts might have to take notice of their unexpected physical reactions and figure out what should be done next. The independence in assessment of the situation is crucial when the communication between Earth and the astronauts is lagged.

This exercise offers practice in various health-related situations with limited communication.

### Secondary Target Users: Long-Duration Mission Astronauts

The platform could also serve as a simulation environment for astronauts undertaking long space missions.

These astronauts might encounter health issues due to the space environment, routine tasks, and physical or psychological changes.

### Supporting Users: Ground-Based Medical Teams

Ground-based medical and mission support teams may also find the simulation useful for understanding the challenges astronauts face when making decisions without immediate guidance.

## 5. Key Features

### 5.1 Medical Scenario Selection

INTERIM includes six simulated astronaut health scenarios:

| ID | Scenario | Description |
|---|---|---|
| S1 | Chest Pain | Chest pain and elevated heart rate |
| S2 | Insomnia and Low Mood | Sleep problems and changes in mood |
| S3 | Elevated CO₂ | High CO₂ levels accompanied by headache |
| S4 | Low Blood Pressure | Dizziness and low blood pressure |
| S5 | Post-EVA Symptoms | Nausea and skin redness after EVA |
| S6 | Irregular Heartbeat | Palpitations and irregular heartbeat |

Users can select a scenario and review the information before deciding how to respond.

### 5.2 Communication Delay and Blackout Simulation

Communication with Earth is an important part of astronaut mission support. However, communication may not always be immediate.

INTERIM includes two simulated communication conditions:

- **Communication Delay:** Users experience a waiting period before receiving simulated ground advice.
- **Communication Blackout:** Users must make decisions without receiving an immediate ground response.

These situations allow users to experience the difficulty of making decisions when external support is limited.

### 5.3 Time-Based Decision Evaluation

Each scenario has its own response-time limit.

The system measures how long users take to make their decisions and evaluates their responses against simulated ground recommendations.

The results include:

- **Too Slow:** The user takes longer than the allowed response time.
- **Matches Ground:** The user's decision matches the simulated ground recommendation.
- **Under-response:** The selected action is less urgent than recommended.
- **Overreaction:** The selected action is more urgent than recommended.
- **Acceptable:** The selected action falls within an acceptable response range.

This feature highlights two important aspects of decision-making: choosing an appropriate action and making the decision within a reasonable amount of time.

### 5.4 Interactive Human Body Navigation

Users can explore medical scenarios through a body-location selection interface.

By selecting different body regions, users can find related scenarios and navigate to the corresponding simulation.

This provides another way to explore the available medical situations instead of selecting everything from a scenario list.

### 5.5 Daily Wake-Up Check-In

Before starting a simulation, users can complete a simple sleep and readiness check-in.

The check-in introduces the importance of sleep and personal well-being during space missions.

Based on the selected condition, users can be directed to a related scenario.

### 5.6 Decision Log

Completed scenarios are saved in the Decision Log.

Users can review their previous decisions and simulation results without having to repeat the scenarios.

This feature also helps users keep track of their completed training sessions.

### 5.7 Performance Profile

INTERIM provides a Performance Profile after users complete at least three scenarios without AI assistance.

The profile summarises their decision-making performance and provides an overview of their previous simulation results.

It encourages users to reflect on their decisions and identify areas where they can improve.

## 6. How to Use INTERIM

1. **Open the Website** – Visit the INTERIM live demo.
2. **Complete the Check-In** – Select your current sleep and readiness condition.
3. **Choose a Scenario** – Select a medical scenario directly or explore using the body-location interface.
4. **Review the Situation** – Read the astronaut's symptoms and available information.
5. **Make a Decision** – Choose an appropriate action within the scenario's response-time limit.
6. **Receive Ground Advice** – Review the simulated ground recommendation and compare it with your decision.
7. **Check Your Results** – View the outcome of the scenario.
8. **Review Your Progress** – Visit the Decision Log and Performance Profile.

## 7. Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Structure of the web application |
| CSS3 | Website layout, styling and responsive design |
| JavaScript | Scenario logic, timers and user interactions |
| Three.js | 3D human body visualization, where enabled |
| Browser Local Storage | Saving user progress and decision records |
| GitHub Pages | Hosting the web application |

## 8. Getting Started

### Live Demo

The application can be accessed through the following link:

https://limlining.github.io/Nasa-Interim/


## 9. Project Objectives

The main objectives of INTERIM are:

- To introduce health-related challenges astronauts may experience during space missions.
- To provide a simulation environment for practising independent decision-making.
- To demonstrate how communication delays can affect responses to medical situations.
- To encourage timely and appropriate actions when immediate ground support is unavailable.
- To allow users to review their decisions through recorded results and performance feedback.

## 10. Future Improvements

There are several areas that could be developed further:

- Adding more EVA-related medical scenarios.
- Integrating relevant NASA open datasets and astronaut health information.
- Improving the 3D human body model and body-region selection.
- Introducing more detailed health indicators.
- Improving the simulation of communication delays.
- Adding more detailed performance reports and decision analysis.

## 11. Limitations and Disclaimer

INTERIM is presently a simulation-oriented educational prototype.

The medical situations, health data, time constraints, and ground recommendations are simulated. They are not medically verified guidelines and must not be relied upon for any medical decision-making or diagnosis.

This software does not serve as an alternative to professional medical advice and is not capable of providing real-time health monitoring of astronauts.

This project is independently built as part of the NASA Space Apps challenge of 2026 and is not officially associated with NASA.

## 12. References and Acknowledgements

- [NASA Space Apps Challenge](https://www.spaceappschallenge.org/)
- [NASA Official Website](https://www.nasa.gov/)


**INTERIM**

*Helping astronauts make better decisions when immediate support is not available.*
