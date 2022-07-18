class Car {
    constructor(x, y, width, height, controlType = "DUMMY", maxSpeed = 3.5) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.controlType = controlType;

        this.initialY = y;
        this.createdAt = Date.now();

        this.speed = 0;
        this.acceleration = 0.2;
        this.maxSpeed = maxSpeed;
        this.friction = 0.07;

        this.angle = 0;
        this.polygon = [];
        this.damaged = false;

        // this.angleAcceleration = 0;
        // this.maxAngleAcceleration = 0.08;
        // this.angleFriction = 0.0005;

        if (controlType !== "DUMMY") {
            this.sensor = new Sensor(this);
            this.brain = new NeuNet([this.sensor.rayCount, 21, 6, 4]);
        }

        this.controls = new Controls(controlType);
    }

    getAvgSpeed() {
        return Math.abs(this.y - this.initialY) / (Date.now() - this.createdAt);
    }

    getRating(road) {
        // const currentLane = road.getClosestLane(this.x);
        // const distToLaneCenter = Math.abs(this.x - road.getLaneCenter(currentLane));
        // let k = 1;
        // k = 1 - distToLaneCenter * 0.5 / road.laneWidth;

        return -this.y * this.getAvgSpeed();
        return -this.y;
    }

    update(road, traffic) {
        let roadBorders = road.borders;

        if (!this.damaged) {
            this.#move(road);
            this.polygon = this.createPolygon();
            this.damaged = this.#assessDamage(roadBorders, traffic);
        } else {
            this.speed = 0;
        }

        if (this.sensor) {
            this.sensor.update(roadBorders, traffic);
            const offsets = this.sensor.readings.map(s => s == null ? 0 : 1 - s.offset);
            const outputs = NeuNet.forward(offsets, this.brain);
            // console.log(outputs);

            if (this.controlType === "AI") {
                this.controls.forward = outputs[0];
                this.controls.left = outputs[1];
                this.controls.right = outputs[2];
                this.controls.reverse = outputs[3];
            }
        }
    }

    #assessDamage(roadBorders, traffic) {
        for (let i = 0; i < roadBorders.length; ++i)
            if (polysIntersect(this.polygon, roadBorders[i]))
                return true;

        for (let i = 0; i < traffic.length; ++i)
            if (polysIntersect(this.polygon, traffic[i].polygon))
                return true;

        return false;
    }

    createPolygon() {
        const cos_a = Math.cos(this.angle);
        const sin_a = Math.sin(-this.angle);

        const cx = this.x;
        const cy = this.y;

        const w = this.width / 2;
        const h = this.height / 2;

        return [
            {x:  cx + w * cos_a - h * sin_a, y: cy + w * sin_a + h * cos_a},
            {x:  cx + w * cos_a + h * sin_a, y: cy + w * sin_a - h * cos_a},
            {x:  cx - w * cos_a + h * sin_a, y: cy - w * sin_a - h * cos_a},
            {x:  cx - w * cos_a - h * sin_a, y: cy - w * sin_a + h * cos_a},
        ];
    }

    #move(road) {
        // forward-backward

        if (this.controls.forward)
            this.speed += this.acceleration;

        if (this.controls.reverse)
            this.speed -= this.acceleration;

        let speedSign = Math.abs(this.speed) / this.speed;

        if (Math.abs(this.speed) > this.maxSpeed)
            this.speed = this.maxSpeed * speedSign;

        if (Math.abs(this.speed) > this.friction)
            this.speed -= this.friction * speedSign;

        if (Math.abs(this.speed) < this.friction)
            this.speed = 0;

        // left-right

        if (Math.abs(this.speed) >= this.friction) {
            const flip = this.speed / this.maxSpeed;
            if (this.controls.left)
                this.angle += 0.02 * flip;

            if (this.controls.right)
                this.angle -= 0.02 * flip;

            if (!(this.controls.left || this.controls.right) && Math.abs(this.angle) < Math.PI / 40)
                this.angle /= 10;
        }

        this.x -= this.speed * Math.sin(this.angle);
        this.y -= this.speed * Math.cos(this.angle);
    }

    draw(ctx, drawSensor) {
        ctx.fillStyle = "#565886";

        if (this.damaged)
            ctx.fillStyle = "#865656";

        if (this.controlType === "DUMMY")
            ctx.fillStyle = "#56867b";

        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
        for (let i = 1; i < this.polygon.length; ++i) {
            ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
        }
        ctx.fill();

        if (this.sensor && drawSensor)
            this.sensor.draw(ctx);
    }
}