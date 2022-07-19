

function generateCars(carsAmount, mutationAmount = 0.05) {
    const cars = [];
    let leaderBrain = null;

    if (localStorage.getItem("bestBrain")) {
        leaderBrain = JSON.parse(localStorage.getItem("bestBrain"));
        leader.brain = leaderBrain;
    }

    cars.push(leader);

    for (let i = 1; i < carsAmount; ++i) {
        cars.push(new Car(road.getLaneCenter(1), leader.y, 30, 50, "AI"));

        if (leaderBrain) {
            cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));
            NeuNet.mutate(cars[i].brain, mutationAmount);
        }
    }

    return cars;
}

function generateTraffic(carsAmount, addFirstCenteredCar = false) {
    const traffic = [];

    if (addFirstCenteredCar)
        traffic.push(new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2));

    for (let i = traffic.length; i < carsAmount; ++i)
        traffic.push(new Car(road.getLaneCenter(Math.round(Math.random() * 10) % road.laneCount), -100 - 300 * i * (Math.random() / 2 + 0.5), 30, 50, "DUMMY", 2 + Math.random() * 0.5 - 0.3));

    return traffic;
}