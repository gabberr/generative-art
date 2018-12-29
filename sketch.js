const canvasSketch = require("canvas-sketch");
const { lerp } = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");
const palettes = require("nice-color-palettes");

const settings = {
    dimensions: [2048, 2048]
};

const sketch = () => {
    const colorCount = 6;
    const palette = random.shuffle(random.pick(palettes)).slice(0, colorCount);
    const createGrid = () => {
        const points = [];
        const count = 6;

        for (let x = 0; x < count; x++) {
            for (let y = 0; y < count; y++) {
                const u = count <= 1 ? 0.5 : x / (count - 1);
                const v = count <= 1 ? 0.5 : y / (count - 1);

                // const radius = Math.abs(random.noise2D(u, v)) * 0.2;
                points.push({
                    // color: random.pick(palette),
                    position: [u, v]
                });
            }
        }
        return points;
    };

    const points = createGrid();
    const margin = 200;

    const createShapes = points => {
        const shapes = [];

        const pts = random.shuffle(points);
        let done = false;
        do {
            if (pts.length < 2) {
                done = true;
            } else {
                let [a, b] = pts.splice(0, 2);
                let c = {
                    position: [b.position[0], 1]
                };

                let d = {
                    position: [a.position[0], 1]
                };

                shapes.push([a, b, c, d]);
            }
        } while (!done);

        return shapes;
    };

    const sortShapes = shapes => {
        shapes.sort((shape1, shape2) => {
            let [a1, b1] = shape1;
            let [a2, b2] = shape2;

            return (
                a1.position[1] + b1.position[1] >
                a2.position[1] + b2.position[1]
            );
        });
    };

    const shapes = createShapes(points);
    sortShapes(shapes);
    console.log("hello");
    console.log(shapes);

    return ({ context, width, height }) => {
        context.fillStyle = "grey";
        context.fillRect(0, 0, width, height);
        // points.forEach(({ position, color }) => {
        //     let [u, v] = position;
        //     const x = lerp(margin, width - margin, u);
        //     const y = lerp(margin, height - margin, v);

        //     // context.fillStyle = color;
        //     context.beginPath();
        //     context.arc(x, y, 20, 0, Math.PI * 2);
        //     context.stroke();
        // });

        shapes.forEach(shape => {
            let [a] = shape;
            let [u, v] = a.position;
            const x = lerp(margin, width - margin, u);
            const y = lerp(margin, height - margin, v);

            context.lineWidth = "30";
            context.moveTo(x, y);
            context.beginPath();

            shape.forEach(({ position }) => {
                let [u, v] = position;
                const x = lerp(margin, width - margin, u);
                const y = lerp(margin, height - margin, v);
                context.lineTo(x, y);
            });
            context.closePath();
            context.fillStyle = random.pick(palette);
            context.strokeStyle = "white";
            context.stroke();
            context.fill();

            context.moveTo(a.position[0], a.position[1]);
        });
    };
};

canvasSketch(sketch, settings);
