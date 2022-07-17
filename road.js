class Road {
    constructor(x, width, laneCount = 3) {
        this.x = x;
        this.width = width;
        this.laneCount = laneCount;

        this.left = x - width / 2;
        this.right = x + width / 2;
        this.laneWidth = (this.right - this.left) / this.laneCount;

        this.top = -inf;
        this.bottom = inf;

        const topLeft = {x: this.left, y: this.top};
        const bottomLeft = {x: this.left, y: this.bottom};

        const topRight = {x: this.right, y: this.top};
        const bottomRight = {x: this.right, y: this.bottom};

        this.borders = [
            [topLeft, bottomLeft],
            [topRight, bottomRight]
        ];
    }

    getLaneCenter(laneIdx) {
        return this.left + this.laneWidth * (laneIdx + .5)
    }

    draw(ctx) {
        ctx.lineWidth = 5;
        ctx.strokeStyle = "white";

        for (let i = 1; i < this.laneCount; ++i) {
            const x = this.left + this.laneWidth * i;

            ctx.beginPath();
            ctx.setLineDash([15, 30]);
            ctx.moveTo(x, this.top);
            ctx.lineTo(x, this.bottom);
            ctx.stroke();
        }

        ctx.setLineDash([]);

        ctx.beginPath();
        ctx.moveTo(this.left - 2.5, this.top);
        ctx.lineTo(this.left - 2.5, this.bottom);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.right + 2.5, this.top);
        ctx.lineTo(this.right + 2.5, this.bottom);
        ctx.stroke();
    }
}