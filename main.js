const TRAFFIC_SIZE = 5;
const INITIAL_CARS_AMOUNT = 1;
const RESPAWN = false;

let globalTrafficIndex = 0;
let running = true;

const roadCanvas = document.getElementById("mainCanvas");
roadCanvas.width = 200;

const roadCtx = roadCanvas.getContext("2d");
const road = new Road(roadCanvas.width / 2, roadCanvas.width * .9, 3)
let winner = new Car(road.getLaneCenter(1), 100, 30, 50, "AI");
let cars = generateCars(INITIAL_CARS_AMOUNT);
let traffic = generateTraffic(TRAFFIC_SIZE);

function generateCars(carsAmount) {
    const cars = [];
    let winnerBrain = null;

    if (localStorage.getItem("bestBrain")) {
        // alert("Loaded!");
        winnerBrain = JSON.parse(localStorage.getItem("bestBrain"));
        winner.brain = winnerBrain;
    }

    cars.push(winner);

    for (let i = 1; i < carsAmount; ++i) {
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI"));

        if (winnerBrain) {
            cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));
            NeuNet.mutate(cars[i].brain, 0.05);
        }
    }

    return cars;
}

function generateTraffic(carsAmount) {
    const traffic = [
        // new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2)
    ];

    for (let i = traffic.length; i < carsAmount; ++i)
        traffic.push(new Car(road.getLaneCenter(Math.round(Math.random() * 10) % road.laneCount), -100 - 300 * i * (Math.random() / 2 + 0.5), 30, 50, "DUMMY", 2 + Math.random() * 0.5 - 0.3));

    globalTrafficIndex = carsAmount;

    return traffic;
}

function animate() {
    let newCars = [];

    if (running) {
        traffic = traffic.filter(trafficCar => (trafficCar.y <= winner.y + roadCanvas.height * 0.3));
        while (traffic.length < TRAFFIC_SIZE) {
            globalTrafficIndex++;
            console.log("boom");
            traffic.push(new Car(road.getLaneCenter(Math.round(Math.random() * 10) % road.laneCount), winner.y - 300 * (Math.random() / 2 + 2.5), 30, 50, "DUMMY", 2 + Math.random() * 0.5 - 0.3));
        }

        traffic.forEach(dummyCar => dummyCar.update(road, []));
        cars.forEach(car => car.update(road, traffic));

        cars = cars.filter(car => (!car.damaged && car.y <= winner.y + roadCanvas.height * 0.3));

        cars.forEach(car => {
            if (car.getRating(road) > winner.getRating(road) || winner.damaged)
                winner = car;
        });
    }

    roadCanvas.height = window.innerHeight;

    roadCtx.save();
    roadCtx.translate(0, -winner.y + roadCanvas.height * 0.7);

    road.draw(roadCtx);
    traffic.forEach(dummyCar => dummyCar.draw(roadCtx));
    roadCtx.globalAlpha = 0.2;
    cars.forEach(car => car.draw(roadCtx, false));
    roadCtx.globalAlpha = 1;

    if (winner.polygon[0]) {
        winner.draw(roadCtx, true);
    }

    roadCtx.restore();

    if (running) {
        newCars.forEach(car => cars.push(car));
    }

    if ((Math.abs(winner.y) > 15000 || winner.damaged || cars.length < INITIAL_CARS_AMOUNT / 300) && INITIAL_CARS_AMOUNT > 1) {
        save(true);
        location.reload();
    } else if (winner.damaged && INITIAL_CARS_AMOUNT === 1)
        location.reload();

    requestAnimationFrame(animate);
}

function save(force = false) {
    let prevBestY = localStorage.getItem("prevBestY");
    console.log(prevBestY);
    if (!prevBestY || prevBestY < Math.abs(winner.y) || force) {
        localStorage.setItem("prevBestY", Math.abs(winner.y).toString());
        localStorage.setItem("bestBrain", JSON.stringify(winner.brain));
        // alert("Saved");
    }
}

function discard() {
    localStorage.removeItem("bestBrain");
    localStorage.removeItem("prevBestY");
}

function togglePause(button) {
    running = !running;
    button.innerHTML = running ? "| |" : ">"
}

function copyCurrentBrain() {
    navigator.clipboard.writeText(JSON.stringify(winner.brain));
}

function applyCurrentBrain() {
    const strData = document.getElementById("customBrain").value;
    console.log(strData);
    winner.brain = JSON.parse(strData);
}

function copyWinnerCar() {
    navigator.clipboard.writeText(JSON.stringify(winner));
}

animate();