function Point(x, y) {
    this.x = x;
    this.y = y;
}

function Rectangle(pointA, pointB, pointC, pointD) {
    this.a = pointA;
    this.b = pointB;
    this.c = pointC;
    this.d = pointD;
}

function Normal(pointA, pointB) {
    dirX = pointB.y - pointA.y;
    dirY = pointA.x - pointB.x;
    var length = Math.sqrt(dirX * dirX + dirY * dirY);
    dirX /= length;
    dirY /= length;

    return new Point(dirX, dirY);
}

function Viewport(width, height, x, y) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
}

function RenderRectangle(context, viewport, rectangle, clear) {
    if (clear == undefined) clear = true;
    if (clear) {
        context.beginPath();
        context.strokeStyle = '#000000';
        context.rect(viewport.x, viewport.y, viewport.width, viewport.height);
        context.stroke();
    }

    context.beginPath();
    context.strokeStyle = '#000000';
    context.moveTo(viewport.width * rectangle.a.x + viewport.x, viewport.height * rectangle.a.y + viewport.y);
    context.lineTo(viewport.width * rectangle.b.x + viewport.x, viewport.height * rectangle.b.y + viewport.y);
    context.lineTo(viewport.width * rectangle.c.x + viewport.x, viewport.height * rectangle.c.y + viewport.y);
    context.lineTo(viewport.width * rectangle.d.x + viewport.x, viewport.height * rectangle.d.y + viewport.y);
    context.lineTo(viewport.width * rectangle.a.x + viewport.x, viewport.height * rectangle.a.y + viewport.y);
    context.fill();
}

function RenderNormal(context, viewport, normal, pointA, pointB) {
    var start = new Point((pointA.x + pointB.x) * 0.5, (pointA.y + pointB.y) * 0.5);
    var end = new Point(start.x + 0.15 * normal.x, start.y + 0.15 * normal.y);

    var fromX = viewport.width * start.x + viewport.x;
    var fromY = viewport.height * start.y + viewport.y;
    var toX = viewport.width * end.x + viewport.x;
    var toY = viewport.height * end.y + viewport.y;

    context.beginPath();
    context.strokeStyle = '#ff0000';
    context.moveTo(fromX, fromY);
    context.lineTo(toX, toY);
    context.stroke();

    context.save();
    context.translate(toX, toY);
    var angle = -Math.atan((toX - fromX) / (toY - fromY));
    if (toY - fromY < 0) {
        angle += Math.PI;
    }
    context.rotate(angle);

    context.beginPath();
    context.strokeStyle = '#ff0000';
    context.moveTo(-5, -5);
    context.lineTo(0, 0);
    context.lineTo(5, -5);
    context.stroke();

    context.restore();
}

function LinearTransformation(linearPart) {
    this.A = linearPart;
}

function ApplyLinearTransformation(linearTransf, point) {
    return new Point(linearTransf.A[0] * point.x + linearTransf.A[1] * point.y,
                        linearTransf.A[2] * point.x + linearTransf.A[3] * point.y)
}

var Basic1 = function () {

    function BuildNormalTransformation(linearTransf) {
        // TODO:    Build up the normal transformation corresponding 
        //          to the linear transformation stored in linearTransf. 
        //          Replace the following dummy line.
        return linearTransf;



    }

    function ShearingX(shearX) {
        return new LinearTransformation([1.0, shearX, 0.0, 1.0]);
    }

    return {
        start: function (canvas) {
            var context = canvas.getContext("2d");
            context.clearRect(0, 0, 600, 200);
            context.font = "18px Georgia";
            context.textAlign = "center";

            var pointA = new Point(0.3, 0.3);
            var pointB = new Point(0.7, 0.3);
            var pointC = new Point(0.7, 0.7);
            var pointD = new Point(0.3, 0.7);

            var rectangle = new Rectangle(pointA, pointB, pointC, pointD);

            var normalAB = Normal(pointA, pointB);
            var normalBC = Normal(pointB, pointC);
            var normalCD = Normal(pointC, pointD);
            var normalDA = Normal(pointD, pointA);

            // render the input rectangle and the corresponding normals
            var viewport = new Viewport(200, 200, 0, 0);
            context.fillText("Input Rectangle", 100, 190);
            RenderRectangle(context, viewport, rectangle);
            RenderNormal(context, viewport, normalAB, pointA, pointB);
            RenderNormal(context, viewport, normalBC, pointB, pointC);
            RenderNormal(context, viewport, normalCD, pointC, pointD);
            RenderNormal(context, viewport, normalDA, pointD, pointA);

            var shearing = ShearingX(0.2);

            // render the rectangle and the normals both transformed with the same matrix
            viewport = new Viewport(200, 200, 200, 0);
            context.fillText("Incorrect Normals", 300, 190);
            var rectangleShearing = new Rectangle(ApplyLinearTransformation(shearing, rectangle.a),
                                                    ApplyLinearTransformation(shearing, rectangle.b),
                                                    ApplyLinearTransformation(shearing, rectangle.c),
                                                    ApplyLinearTransformation(shearing, rectangle.d));
            RenderRectangle(context, viewport, rectangleShearing);
            var normalAB_incorrect = ApplyLinearTransformation(shearing, normalAB);
            var normalBC_incorrect = ApplyLinearTransformation(shearing, normalBC);
            var normalCD_incorrect = ApplyLinearTransformation(shearing, normalCD);
            var normalDA_incorrect = ApplyLinearTransformation(shearing, normalDA);
            RenderNormal(context, viewport, normalAB_incorrect, ApplyLinearTransformation(shearing, rectangle.a), ApplyLinearTransformation(shearing, rectangle.b));
            RenderNormal(context, viewport, normalBC_incorrect, ApplyLinearTransformation(shearing, rectangle.b), ApplyLinearTransformation(shearing, rectangle.c));
            RenderNormal(context, viewport, normalCD_incorrect, ApplyLinearTransformation(shearing, rectangle.c), ApplyLinearTransformation(shearing, rectangle.d));
            RenderNormal(context, viewport, normalDA_incorrect, ApplyLinearTransformation(shearing, rectangle.d), ApplyLinearTransformation(shearing, rectangle.a));


            var shearingNormals = BuildNormalTransformation(shearing);

            //render the rectangle transformed with the original matrix and the normals transformed with the normal matrix
            viewport = new Viewport(200, 200, 400, 0);
            context.fillText("Correct Normals", 500, 190);
            RenderRectangle(context, viewport, rectangleShearing);
            var normalAB_correct = ApplyLinearTransformation(shearingNormals, normalAB);
            var normalBC_correct = ApplyLinearTransformation(shearingNormals, normalBC);
            var normalCD_correct = ApplyLinearTransformation(shearingNormals, normalCD);
            var normalDA_correct = ApplyLinearTransformation(shearingNormals, normalDA);
            RenderNormal(context, viewport, normalAB_correct, ApplyLinearTransformation(shearing, rectangle.a), ApplyLinearTransformation(shearing, rectangle.b));
            RenderNormal(context, viewport, normalBC_correct, ApplyLinearTransformation(shearing, rectangle.b), ApplyLinearTransformation(shearing, rectangle.c));
            RenderNormal(context, viewport, normalCD_correct, ApplyLinearTransformation(shearing, rectangle.c), ApplyLinearTransformation(shearing, rectangle.d));
            RenderNormal(context, viewport, normalDA_correct, ApplyLinearTransformation(shearing, rectangle.d), ApplyLinearTransformation(shearing, rectangle.a));

        }
    }
}()
