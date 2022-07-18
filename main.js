const TRAFFIC_SIZE = 5;
const INITIAL_CARS_AMOUNT = 1000;
const RESPAWN = false;

let globalTrafficIndex = 0;

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
            NeuNet.mutate(cars[i].brain, 100 / INITIAL_CARS_AMOUNT);
        }
    }

    return cars;
}

function generateTraffic(carsAmount) {
    const traffic = [
        new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2)
    ];

    for (let i = traffic.length; i < carsAmount; ++i)
        traffic.push(new Car(road.getLaneCenter(Math.round(Math.random() * 10) % road.laneCount), -100 - 200 * i * (Math.random() / 2 + 0.5), 30, 50, "DUMMY", 2 + Math.random() - 0.3));

    globalTrafficIndex = carsAmount;

    return traffic;
}

function animate() {
    traffic = traffic.filter(trafficCar => (trafficCar.y <= winner.y + roadCanvas.height * 0.3));
    while (traffic.length < TRAFFIC_SIZE) {
        globalTrafficIndex++;
        console.log("boom");
        traffic.push(new Car(road.getLaneCenter(Math.round(Math.random() * 10) % road.laneCount), winner.y - 300 * (Math.random() / 2 + 2.5), 30, 50, "DUMMY", 2 + Math.random() - 0.3));
    }

    traffic.forEach(dummyCar => dummyCar.update(road, []));
    cars.forEach(car => car.update(road, traffic));

    let newCars = [];
    cars = cars.filter(car => {
        if ((!car.damaged && car.y <= winner.y + roadCanvas.height * 0.5))
            return true;

        if (car.y <= winner.y + roadCanvas.height) {
            for (let i = 0; i < 1; ++i) {
                let newCar = new Car(car.x, car.y, car.width, car.height, "AI");
                newCar.brain = car.brain;
                newCar.angle = car.angle;
                newCar.speed = car.speed / 50;
                NeuNet.mutate(newCar.brain, 0.2);
                newCars.push(newCar);
            }
        }

        return false;
    });

    if (RESPAWN && cars.length < INITIAL_CARS_AMOUNT / 2) {
        for (let i = cars.length; i < INITIAL_CARS_AMOUNT; ++i) {
            let newCar = new Car(winner.x, winner.y - winner.width / 2, winner.width, winner.height, "AI");
            newCar.brain = JSON.parse(JSON.stringify(winner.brain));
            newCar.angle = winner.angle;
            newCar.speed = winner.speed;
            NeuNet.mutate(newCar.brain, 0.05);
            newCars.push(newCar);
        }
    }

    cars.forEach(car => {
        if (car.getRating() > winner.getRating() || winner.damaged)
            winner = car;
    });

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

    newCars.forEach(car => cars.push(car));

    // let shouldReload = true;
    // let avgDist = 0;
    // for (let i = 0; i < cars.length; ++i) {
    //     avgDist += cars[i].y + 100;
    //     if (Math.abs(cars[i].speed) > 1)
    //         shouldReload = false;
    // }
    //
    // if (shouldReload) {
    //     if (cars.length > 0) {
    //         avgDist /= cars.length;
    //         if (Math.abs(winner.y) > roadCanvas.height * 0.2) {
    //             save();
    //             location.reload();
    //         }
    //     }
    // }

    if (Math.abs(winner.y) > 5000 || winner.damaged) {
        save(true);
        location.reload();
    }

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

animate();