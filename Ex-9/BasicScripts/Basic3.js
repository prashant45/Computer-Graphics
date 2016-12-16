var Basic3 = function () {

    // fractal refinement steps
    var steps = 1;

    function createBox() {

        // TODO 9.3a)   Set up a shape node, a box node,
        //              an appearance node and a material
        //              node. Use the material node to 
        //              define the color of the box as white.
        //              Then, append the material node to the 
        //              appearance node, both appearance and 
        //              box node to the shape node. Return the
        //              shape node.
        //              You will have to make use of the functions
        //              createElement(), setAttribute() and 
        //              appendChild(). You can find examples for
        //              their usage in createScene().

        var shape = document.createElement("shape");
		var box = document.createElement("box");
		var appearance = document.createElement("appearance");
		var material = document.createElement("material");
		
		material.setAttribute("diffusecolor", "1 1 1");
		
		appearance.appendChild(material);
		shape.appendChild(appearance);
		shape.appendChild(box);
		
		return shape;
	}

    function refine(parents) {
        // refine each of the transformations ("parents") into 12 single transformations
        var children = new Array(parents.length * 12);
        var counter = 0;
        for (var p = 0; p < parents.length; p++) {
            // for each of the 27 smaller "boxes", ...
            for (var i = -1; i <= 1; i++) {
                for (var j = -1; j <= 1; j++) {
                    for (var k = -1; k <= 1; k++) {
                        // ... decide whether they should be considered or thrown away
                        var sum = Math.abs(i) + Math.abs(j) + Math.abs(k);
                        if (sum < 3 && sum > 1) {
                            // set up a new child transformation
                            children[counter] = constructChildTransformation(parents[p], 0.66 * i + " " + 0.66 * j + " " + 0.66 * k);
                            counter++;
                        }
                    }
                }
            }
        }

        return children;
    }

    function constructChildTransformation(parent, translation) {

        // TODO 9.3b):  Create a new transformation node
        //              for one child box (or for further
        //              refinement!). The child box
        //              has to be scaled to one third of
        //              its parent's size, and the translation
        //              has to be applied. Finally, the 
        //              new transformation should be appended
        //              to its parent transformation.
        //              Again, use createElement(), setAttribute()
        //              and appendChild().
        //              Replace the following dummy line.
		
		var transform = document.createElement("transform");
		
		transform.setAttribute("scale", "0.33 0.33 0.33");
		transform.setAttribute("translation", translation);
		
		parent.appendChild(transform);
		
		return transform;

    }

    function createScene() {
        // get the x3dom scene node, which will contain the fractal,
        // and remove all children already there, except for the viewpoints
        var scene = document.getElementById("fractal");
        while (scene.children.length > 2) {
            scene.removeChild(scene.lastChild);
        }

        // append a background node, which makes the whole background dark blue
        var background = document.createElement("background");
        background.setAttribute("groundColor", "0 0 0.3");
        background.setAttribute("skyColor", "0 0 0.3");
        scene.appendChild(background);

        // create the root transform, which enlarges its contents 
        var transf = document.createElement("transform");
        transf.setAttribute("scale", "2 2 2");
        scene.appendChild(transf);

        // create a list of transforms which are filled with boxes in the end
        // initially, this only contains the root transform
        var listOfTransforms = [transf];

        // for the number of iterations stored in "steps",
        // compute the new list of transforms from the old list
        // of transforms using the function refine()
        for (var i = 0; i < steps; i++) {
            listOfTransforms = refine(listOfTransforms);
        }

        // for every transform in the resulting list,
        // append a box to be drawn
        for (var i = 0; i < listOfTransforms.length; i++) {
            var box = createBox();
            listOfTransforms[i].appendChild(box);
        }
    }

    return {
        start: function () {
            document.getElementById("slider").value = 1;

            createScene();
        },

        changeViewingMode: function () {
            var viewpoint = document.getElementById('merryChristmas');
            viewpoint.setAttribute('orientation', '-0.58902 0.77371 0.23329 0.99599');
            viewpoint.setAttribute('position', '7 7 7');
            viewpoint.setAttribute('set_bind', 'true');
            document.getElementById('hidden').setAttribute('style', '');
        },

        changeSteps: function (value) {
            steps = value;
            createScene();
        }
    }
}()
