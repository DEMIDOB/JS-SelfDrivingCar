const canvas = document.getElementById("mainCanvas");
canvas.width = 250;

const ctx = canvas.getContext("2d");
const road = new Road(canvas.width / 2, canvas.width * .9, 3)
const car = new Car(road.getLaneCenter(1), 100, 30, 50, "AI");

const traffic = [
    new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2)
];

animate();

function animate() {
    traffic.forEach(dummyCar => dummyCar.update(road.borders, []));
    car.update(road.borders, traffic);

    canvas.height = window.innerHeight;

    ctx.save();
    ctx.translate(0, -car.y + canvas.height * 0.7);

    road.draw(ctx);
    traffic.forEach(dummyCar => dummyCar.draw(ctx));
    car.draw(ctx);

    ctx.restore();

    requestAnimationFrame(animate);
}