{
    function AssembleSelectedLayers(thisObj) {
        var scriptName = "Gem";
        var textValue = "";
        var codeValue = "";
        var orientation = 'l';
        var right = false;
        var gemCont;
        var nextChain;
        var check = false;
        var uncheck = true;
        var gemSize = 100;





        ///SHAMELESS STEALING 





        var configs = {
            title: 'Explode layer tool',
            debug: false,
            log: true,
            itemAmountWarning: 50,
            dryRun: false,
        };
        //        function cLog(text) {
        //    if (configs.log)
        //        $.writeln(text);
        //}   
        //start steal
        function explodeLayer(layer) {

            //cLog('Exploding layer : ' + layer.name);

            // Get the elements of the original shape layer
            var contents = layer.property("Contents");
            var layers = [];

            if (contents.numProperties > configs.itemAmountWarning) {

                var go = confirm(
                    'You have more than ' + configs.itemAmountWarning + ' elements. ' +
                    'Execution time might be long, are you sure you want to continue ?'
                );

                if (!go) return;

            }

                
              

            // Browse through contents array
            for (var i = contents.numProperties; i > 0; i--) {

                // Get the original property
                var _prop = contents.property(i);
                //pb.update(contents.numProperties - i)

                // Skip the property if not enabled
                if (!_prop.enabled) continue;

                // Duplicate the original layer and rename with property name
                var new_layer = emptyDuplicateLayer(layer)

                new_layer.name = layer.name + ' - ' + _prop.name;
                new_layer.enabled = false;
                new_layer.shy = true;

                layers.push(new_layer);

                if (!new_layer.property("Contents").canAddProperty(_prop.matchName)) continue;

                var prop = new_layer.property("Contents").addProperty(_prop.matchName)

                copyProperties(_prop, prop, '')

            }
            

            for (var i = 0; i < layers.length; i++) {
                layers[i].enabled = true;
                layers[i].shy = false;
                if (configs.dryRun) layers[i].remove();
            }

            return layers;

        }

        function explode() {

            // Check if multiple layers selected
            if (app.project.activeItem.selectedLayers.length > 1) {
                alert("Select a single shape layer");
                return;
            }

            var selectedLayer = app.project.activeItem.selectedLayers[0];

            // Check if the layer is null or wrong type
            if (selectedLayer == undefined || selectedLayer.matchName !== 'ADBE Vector Layer') {
                alert("Select a shape layer");
                return;
            }

            // cLog('==================')

            //    cLog('Configs :')
            //    for(config in configs) {
            //        if(configs.hasOwnProperty(config))
            //            cLog('    ' + config + ' : ' + configs[config])
            //    }
            //
            //    cLog('')

            //    var execTime = new ExecutionTime();
            //    execTime.start();

            var hideShyLayers_originalState = selectedLayer.containingComp.hideShyLayers;
            selectedLayer.containingComp.hideShyLayers = true;

            var layers = explodeLayer(selectedLayer);

            selectedLayer.moveToBeginning()
            selectedLayer.containingComp.hideShyLayers = hideShyLayers_originalState;
            //
            //    execTime.stop();
            //    cLog(execTime.time());

        }

        function emptyDuplicateLayer(layer) {

            var new_layer = layer.containingComp.layers.addShape();

            copyProperty('anchorPoint', layer, new_layer);
            copyProperty('position', layer, new_layer);
            copyProperty('scale', layer, new_layer);
            copyProperty('rotation', layer, new_layer);
            copyProperty('opacity', layer, new_layer);

            return new_layer;

        }

        function copyProperties(origin, target, prefix) {

            for (var i = 1; i <= origin.numProperties; i++) {

                var _prop = origin.property(i);

                if (!target.canAddProperty(_prop.matchName)) return;
//!_prop.enabled ||
                // cDebug(prefix + _prop.matchName);

                var prop = target.addProperty(_prop.matchName);

                switch (_prop.matchName) {

                    case 'ADBE Vector Filter - Merge':
                        copyProperty('mode', _prop, prop)
                        break;

                    case 'ADBE Vector Materials Group':
                        //cDebug(prefix + '-- skipped');
                        break;

                    case 'ADBE Vector Graphic - Stroke':
                      
                        copyPropertyStroke(_prop, prop);
                        break;

                    case 'ADBE Vector Graphic - Fill':
                        copyPropertyFill(_prop, prop);
                        break;

                    case 'ADBE Vector Transform Group':
                        copyPropertyTransform(_prop, prop);
                        break;

                    case 'ADBE Vector Shape - Rect':
                        copyPropertyRect(_prop, prop);
                        break;

                    case 'ADBE Vector Shape - Ellipse':
                        copyPropertyEllipse(_prop, prop);
                        break;

                    case 'ADBE Vector Shape - Star':
                        if (origin.property(i).property("ADBE Vector Star Inner Radius").canSetExpression == true) {
                            copyPropertyStar(_prop, prop);
                        } else if (origin.property(i).property("ADBE Vector Star Inner Radius").canSetExpression == false) {
                            copyPropertyPolyStar(_prop, prop);
                        }
                        break;

                    case 'ADBE Root Vectors Group':
                    case 'ADBE Vectors Group':
                    case 'ADBE Vector Group':
                        copyProperties(_prop, prop, prefix += '    ')
                        break;

                    case 'ADBE Vector Shape - Group':
                        copyPropertyShape(_prop, prop);
                        break;

                    case 'ADBE Vector Blend Mode':
                        prop.setValue(_prop.value);
                        break;

                }

            }

        }

        function copyProperty(name, origin, target) {
            target[name].setValue(origin[name].value);
        }

        function copyPropertyShape(origin, target) {
            target.property('ADBE Vector Shape').setValue(origin.property('ADBE Vector Shape').value);
        }

        function copyPropertyStroke(origin, target) {

            copyProperty('composite', origin, target);
            copyProperty('color', origin, target);
            copyProperty('strokeWidth', origin, target);
            copyProperty('lineCap', origin, target);
            copyProperty('lineJoin', origin, target);
            copyProperty('miterLimit', origin, target);

            // TOFIX : dash are present, no mater if deleted or not ! (disabled for now)
            // if(false && origin.dash.enabled) {
            //
            //     for(var i=1; i <= origin.dash.numProperties; i++) {
            //
            //         var dashProp = origin.dash.property(i);
            //
            //         if(dashProp.enabled)
            //             target.dash.addProperty(dashProp.matchName).setValue(dashProp.value);
            //
            //     }
            //
            // }

        }

        function copyPropertyFill(origin, target) {
            
            copyProperty('composite', origin, target);
            copyProperty('fillRule', origin, target);
            copyProperty('color', origin, target);

        }

        function copyPropertyTransform(origin, target) {

            copyProperty('anchorPoint', origin, target);
            copyProperty('position', origin, target);
            copyProperty('scale', origin, target);
            copyProperty('skew', origin, target);
            copyProperty('skewAxis', origin, target);
            copyProperty('rotation', origin, target);
            copyProperty('opacity', origin, target);

        }

        function copyPropertyRect(origin, target) {
            copyProperty('shapeDirection', origin, target)
            copyProperty('size', origin, target)
            copyProperty('position', origin, target)
            copyProperty('roundness', origin, target)
        }

        function copyPropertyEllipse(origin, target) {
            copyProperty('shapeDirection', origin, target)
            copyProperty('size', origin, target)
            copyProperty('position', origin, target)
        }

        function copyPropertyStar(origin, target) {
            copyProperty('shapeDirection', origin, target)
            copyProperty('type', origin, target)
            copyProperty('points', origin, target)
            copyProperty('position', origin, target)
            copyProperty('rotation', origin, target)
            copyProperty('innerRadius', origin, target)
            copyProperty('outerRadius', origin, target)
            copyProperty('innerRoundness', origin, target)
            copyProperty('outerRoundness', origin, target)
        }

        function copyPropertyPolyStar(origin, target) {
            copyProperty('shapeDirection', origin, target)
            copyProperty('type', origin, target)
            copyProperty('points', origin, target)
            copyProperty('position', origin, target)
            copyProperty('rotation', origin, target)
            copyProperty('outerRadius', origin, target)
            copyProperty('outerRoundness', origin, target)
        }



        //stop SHAMELESS STEALING


        function createEffector() {

            var myComp = app.project.activeItem;
            var selectedLayers = app.project.activeItem.selectedLayers;
            if (selectedLayers.length == 1) {
                try {
                    var myHand = selectedLayers[0];
                    var width = myHand.width;
                    var height = myHand.height;
                    var position = myHand.position.value;
                    var name = myHand.name;
                    var myEffector = myComp.layers.addSolid([Math.random(), Math.random(), Math.random()], " bone gem", 50, 50, myComp.pixelAspect, myComp.duration);
                    myEffector.parent = myHand.parent;
                    myEffector.position.setValue(position);
                    myEffector.moveAfter(myHand);
                    myEffector.guideLayer = true;
                    myEffector.property("opacity").setValue([50]);
                    myEffector.parent = null;
                    myEffector.property("Effects").addProperty("Checkbox Control").name = "Clockwise";
                    myEffector.property("scale").expression = "[" + gemSize + "," + gemSize + "]";
                } catch (e) {
                    alert(e.line + ":" + e.message);
                }
            } else {
                alert("Select only the Hand or Foot Layer of the Limb", scriptName);
            }
        }

        function IK(ore, effectorName, upperName, lowerName, handName, mirrored) {
            var string =
                "cw = false;\
                checkbox=thisComp.layer('" + effectorName + "').effect('Clockwise')('Checkbox');\
				upper = " + ore + ";\
				upperLimb = '" + upperName + "';\
				lowerLimb = '" + lowerName + "';\
				extremity = '" + handName + "';\
				effector = '" + effectorName + "';\
				checkbox==1 ? cw=true : cw =false;\
				function getWorldPos(theLayerName){\
					var L = thisComp.layer(theLayerName);\
					return L.toWorld(L.anchorPoint);\
				}\
				A = getWorldPos(upperLimb);\
				B = getWorldPos(lowerLimb);\
				C = getWorldPos(extremity);\
				E = getWorldPos(effector);\
				a = length(B,C);\
				b = length(E,A);\
				c = length(A,B);\
				x = (b*b + c*c - a*a )/(2*b);\
				alpha = Math.acos(clamp(x/c,-1,1));\
				if (upper){\
				  D = E - A;\
				  delta = Math.atan2(D[1],D[0]);\
				  result = radiansToDegrees(delta - (cw ? 1 : -1)*alpha);\
				  V = B - A;\
				  adj1 = radiansToDegrees(Math.atan2(V[1],V[0]));\
				  result - adj1 + value;\
				}else{\
				  y = b - x;\
				  gamma = Math.acos(clamp(y/a,-1,1));\
				  result = (cw ? 1 : -1)*(" + mirrored + "radiansToDegrees(gamma + alpha));\
				  V1 = B - A;\
				  adj1 = radiansToDegrees(Math.atan2(V1[1],V1[0]));\
				  V2 = C - B;\
				  adj2 = radiansToDegrees(Math.atan2(V2[1],V2[0]));\
				  result +  adj1 - adj2 + value;\
				};";
            return string;
        }



        function checkbox() {
            if (uncheck) {
                check = true;
                uncheck = false;
            } else if (!uncheck) {
                check = false;
                uncheck = true;
            }
        }

        function onCornerButtonClick() {
            orientation = 'r';
            right = true;
        }

        function onCenterButtonClick() {
            orientation = 'l';
            right = false;
        }

        function on_textSize_Input_changed() {
            gemSize = this.text;
        }

        function on_textInput_changed() {
            textValue = this.text;
        }

        function on_codeEdit_changed() {
            codeValue = this.text;
        }

        function onAssembleClick() {
            app.beginUndoGroup("Gem");
            var activeItem = app.project.activeItem;
            var exeption = my_palette.grp.cmds.dropDown.items[9].selected;

            if ((activeItem == null) && !exeption || !(activeItem instanceof CompItem) && !exeption) {
                alert("Select or open a comp first.", scriptName);
            } else if (my_palette.grp.cmds.dropDown.items[0].selected) {

                if (!check && activeItem.selectedLayers.length <= 1) {
                    alert("First check fx and select a layer to add a controler to it. Then uncheck it and select all 4 layers in this order: shoulder(L) or upper limb(R) -> arm(L) or lower limb(R) -> hand(L) or foot(R) -> bone", scriptName);
                }

                if (check && activeItem.selectedLayers.length < 2) {


                    createEffector();

                } else if (!check || check && activeItem.selectedLayers.length > 1) {

                    if (activeItem.selectedLayers.length < 4) {
                        alert("Select 4 layers in the active comp first.\nL arm\nR leg\nfx add bone or if 4 layers selected - add IK on mirrored limbs \n♦ magic", scriptName);
                    } else {

                        var Upper = activeItem.selectedLayers[0];
                        var Lower = activeItem.selectedLayers[1];
                        var Joint = activeItem.selectedLayers[2];
                        gemCont = activeItem.selectedLayers[3];
                        for (var i = 0; i < 4; i++) {
                            activeItem.selectedLayers[i].parent = null;
                        }

                        var mirrored = '';

                        Lower.parent = Upper;
                        Joint.parent = Lower;

                        var top;
                        var mid;
                        var tip;

                        if (!right) {
                            top = "shoulder";
                            mid = "arm";
                            tip = "hand";
                        }
                        if (right) {
                            top = "hip";
                            mid = "leg";
                            tip = "foot";
                        }
                        if (check) {
                            mirrored = '-'
                        }
                        Upper.name = textValue + ' ' + top;
                        Lower.name = textValue + ' ' + mid;
                        Joint.name = textValue + ' ' + tip;
                        gemCont.name = textValue + " " + mid + " gem";
                        var upperName = Upper.name;
                        var lowerName = Lower.name;
                        var handName = Joint.name;
                        var effectorName = gemCont.name;

                        var stringUpper = IK("true", effectorName, upperName, lowerName, handName, mirrored);
                        var stringLower = IK("false", effectorName, upperName, lowerName, handName, mirrored);
                        Upper.property("rotation").expression = stringUpper;
                        Lower.property("rotation").expression = stringLower;


                        Joint.property("rotation").expression = 'transform.rotation =' + mirrored + 'thisComp.layer("' + textValue + ' ' + mid + ' gem").transform.rotation;';

                    }
                }



            } else if (my_palette.grp.cmds.dropDown.items[1].selected) {


                if (isNaN(textValue)) {
                    alert(textValue + " is not a number. Please enter a number.", scriptName);


                } else {
                    for (var i = 0; i < textValue; i++) {

                        activeItem.layer(1 + i * 3).parent = activeItem.layer('None');
                        activeItem.layer(2 + i * 3).parent = activeItem.layer(1 + i * 3);
                        activeItem.layer(3 + i * 3).parent = activeItem.layer(2 + i * 3);

                        activeItem.layer(1 + i * 3).name = orientation + " " + textValue + i * 3 + " low";
                        activeItem.layer(2 + i * 3).name = orientation + " " + textValue + i * 3 + " middle";
                        activeItem.layer(3 + i * 3).name = orientation + " " + textValue + i * 3 + " tip";

                        activeItem.layer(3 + i * 3).property("rotation").expression = 'transform.rotation = thisComp.layer("' + orientation + ' ' + textValue + i + ' finger gem").transform.rotation;';

                        activeItem.layer(2 + i * 3).property("rotation").expression = 'upper = false; cw =false; checkbox = thisComp.layer("' + orientation + ' ' + textValue + i + ' finger gem").effect("Clockwise")("Checkbox"); checkbox==1 ? cw=true : cw =false;upperLimb ="' + orientation + ' ' + textValue + i * 3 + ' low";lowerLimb ="' + orientation + ' ' + textValue + i * 3 + ' middle";extremity ="' + orientation + ' ' + textValue + i * 3 + ' tip";gem = "' + orientation + ' ' + textValue + i + ' finger gem";function getWorldPos(theLayerName){L = thisComp.layer(theLayerName);return L.toWorld(L.anchorPoint);}A = getWorldPos(upperLimb);B = getWorldPos(lowerLimb);C = getWorldPos(extremity);E = getWorldPos(gem);a = length(B,C);b = length(E,A);c = length(A,B);x = (b*b + c*c -a*a)/(2*b);alpha = Math.acos(clamp(x/c,-1,1));if (upper){D = E - A;delta = Math.atan2(D[1],D[0]);result = radiansToDegrees(delta - (cw ? 1 : -1)*alpha);V = B - A;adj1 = radiansToDegrees(Math.atan2(V[1],V[0]));result - adj1 + value;}else{y = b - x;gamma = Math.acos(clamp(y/a,-1,1));result = (cw ? 1 : -1)*(radiansToDegrees(gamma + alpha));V1 = B - A;adj1 = radiansToDegrees(Math.atan2(V1[1],V1[0]));V2 = C - B;adj2 = radiansToDegrees(Math.atan2(V2[1],V2[0]));result +  adj1 - adj2 + value;};';

                        activeItem.layer(1 + i * 3).property("rotation").expression = 'upper = true; cw =false; checkbox = thisComp.layer("' + orientation + ' ' + textValue + i + ' finger gem").effect("Clockwise")("Checkbox"); checkbox==1 ? cw=true : cw =false;upperLimb ="' + orientation + ' ' + textValue + i * 3 + ' low";lowerLimb ="' + orientation + ' ' + textValue + i * 3 + ' middle";extremity ="' + orientation + ' ' + textValue + i * 3 + ' tip";gem = "' + orientation + ' ' + textValue + i + ' finger gem";function getWorldPos(theLayerName){L = thisComp.layer(theLayerName);return L.toWorld(L.anchorPoint);}A = getWorldPos(upperLimb);B = getWorldPos(lowerLimb);C = getWorldPos(extremity);E = getWorldPos(gem);a = length(B,C);b = length(E,A);c = length(A,B);x = (b*b + c*c -a*a)/(2*b);alpha = Math.acos(clamp(x/c,-1,1));if (upper){D = E - A;delta = Math.atan2(D[1],D[0]);result = radiansToDegrees(delta - (cw ? 1 : -1)*alpha);V = B - A;adj1 = radiansToDegrees(Math.atan2(V[1],V[0]));result - adj1 + value;}else{y = b - x;gamma = Math.acos(clamp(y/a,-1,1));result = (cw ? 1 : -1)*(radiansToDegrees(gamma + alpha));V1 = B - A;adj1 = radiansToDegrees(Math.atan2(V1[1],V1[0]));V2 = C - B;adj2 = radiansToDegrees(Math.atan2(V2[1],V2[0]));result +  adj1 - adj2 + value;};';

                        var fingerRot = activeItem.layer(3 + i * 3).property("rotation").value;
                    }
                    for (i = 0; i < textValue; i++) {
                        gemCont = activeItem.layers.addSolid([Math.random(), Math.random(), Math.random()], orientation + " " + textValue + i + " finger gem", 50, 50, 1);
                        gemCont.property("opacity").setValue([50]);
                        gemCont.guideLayer = true;
                        gemCont.property("rotation").setValue([fingerRot]);
                        gemCont.property("scale").expression = "[" + gemSize + "," + gemSize + "]";
                        gemCont.property("Effects").addProperty("Checkbox Control").name = "Clockwise";
                        gemCont.property("position").setValue([300 * i, 500]);
                    }
                    var leader = activeItem.layers.addSolid([Math.random(), Math.random(), Math.random()], orientation + " finger LEADER gem", 50, 50, 1);
                    leader.guideLayer = true;
                    leader.property("opacity").setValue([50]);
                    leader.property("scale").expression = "[" + gemSize + "," + gemSize + "]";
                    for (var j = 0; j < textValue; j++) {
                        activeItem.layer(2 + j).parent = app.project.activeItem.layer(1);
                    }
                }
                //breath
            } else if (my_palette.grp.cmds.dropDown.items[2].selected) {
                if (activeItem.selectedLayers.length == 0) {
                    alert("Select 1 layer in the active comp first.", scriptName);
                } else {

                    var selectedLayers = activeItem.selectedLayers;

                    for (var i = 0; i < selectedLayers.length; i++) {

                        var xFreq = 'thisComp.layer("' + textValue + '").effect("Frequancy")("Slider")';
                        var xAmp = 'thisComp.layer("' + textValue + '").effect("Ampletude")("Slider")';
                        var xSpeed = 'thisComp.layer("' + textValue + '").effect("Speed")("Slider")';
                        var Power = 'thisComp.layer("' + textValue + '").effect("Power")("Slider")';
                        var Damping = 'thisComp.layer("' + textValue + '").effect("Damping")("Slider")';

                        activeItem.selectedLayers[i].property('position').expression = 'xAmp = ' + xAmp + '; xFreq =' + xFreq + '; xSpeed = ' + xSpeed + '; wl = xSpeed/xFreq; phaseOffset = ((position[0]%wl)/wl)*2*Math.PI;y = xAmp*Math.sin(2*Math.PI*xFreq*time + phaseOffset);value + [0,y];';
                        activeItem.selectedLayers[i].property('rotation').expression = 'xFreq = ' + xFreq + '; xSpeed = ' + xSpeed + '; damping = ' + Damping + '; wl = xSpeed/xFreq; phaseOffset = ((position[0]%wl)/wl)*2*Math.PI;theta = Math.atan(Math.cos(2*Math.PI*xFreq*time + phaseOffset));radiansToDegrees(theta)/damping;';
                    }
                }
                //other
            } else if (my_palette.grp.cmds.dropDown.items[3].selected) {
                //renamer  
                var renameItem = activeItem.selectedLayers;
                if (check) {
                    if (orientation == 'l' && gemSize != "+" && gemSize != "-") {
                        for (var i = 0; i < renameItem.length; i++) {
                            renameItem[i].name = textValue;
                        }
                    } else if (orientation == 'r' && gemSize != "+" && gemSize != "-") {
                        for (var i = 0; i < renameItem.length; i++) {
                            renameItem[i].name = textValue + " " + parseInt(i + 1);
                        }

                    } else if (orientation == 'l' && gemSize == "+" && gemSize != "-") {
                        for (var i = 0; i < renameItem.length; i++) {
                            renameItem[i].name = renameItem[i].name + textValue;
                        }

                    } else if (orientation == 'r' && gemSize == "+" && gemSize != "-") {
                        for (var i = 0; i < renameItem.length; i++) {
                            renameItem[i].name = renameItem[i].name + textValue + " " + parseInt(i + 1);
                        }

                    } else if (orientation == 'l' && gemSize == "-" && gemSize != "+") {
                        for (var i = 0; i < renameItem.length; i++) {
                            renameItem[i].name = textValue + renameItem[i].name;
                        }

                    } else if (orientation == 'r' && gemSize == "-" && gemSize != "+") {
                        for (var i = 0; i < renameItem.length; i++) {
                            renameItem[i].name = textValue + " " + parseInt(i + 1) + " " + renameItem[i].name;
                        }

                    }
                }
                if (!check && textValue == 'help') {
                    alert('List of Misc commands:\n\neye\ngears\nmagnets \nears\ntentacle\ncloth\norphan\nhelp..duh!', scriptName);
                    //other stuff    
                } else if (!check) {
                    var prop;
                    var power = 2;
                    var nextChain;
                    var nextLayer;
                    var len = activeItem.selectedLayers.length;


                    if (textValue == 'ears') {

                        activeItem.selectedLayers[0].property("position").expression = 'x = transform.position[0];y = transform.position[1];xgem = thisComp.layer("head turn gem").transform.position[0];ygem = thisComp.layer("head turn gem").transform.position[1];xRes = x + xgem;yRes = y - ygem;[xRes,yRes];';
                        activeItem.selectedLayers[1].property("position").expression = 'x = transform.position[0];y = transform.position[1];xgem = thisComp.layer("head turn gem").transform.position[0];ygem = thisComp.layer("head turn gem").transform.position[1];xRes = x - xgem;yRes = y - ygem;[xRes,yRes];';
                        gemCont = activeItem.layers.addSolid([0.5, 0.3, 0.4], "head turn gem", 50, 50, 1);
                        gemCont.property("opacity").setValue([50]);
                        gemCont.guideLayer = true;
                        gemCont.property("rotation").setValue([45]);
                        gemCont.property("position").setValue([0, 0]);

                    } else if (textValue == 'tentacle') {
                        for (var i = 0; i < len; i++) {
                            prop = 'rotation';
                            nextChain = 'obsidian';
                            power = 'thisComp.layer("obsidian").effect("Power")("Slider")';
                            activeItem.selectedLayers[i].property(prop).expression = 'transform.' + prop + ' = transform.' + prop + ' + thisComp.layer("' + nextChain + '").transform.' + prop + '/' + power + ';';
                        }
                    } else if (textValue == 'gears') {

                        prop = 'rotation';
                        var len = activeItem.selectedLayers.length;
                        for (var i = 0; i < len - 1; i++) {

                            nextLayer = activeItem.selectedLayers[i + 1].name;
                            activeItem.selectedLayers[i].property(prop).expression = 'transform.rotation = transform.' + prop + ' - thisComp.layer("' + nextLayer + '").transform.' + prop + ';';
                        }

                    } else if (textValue == 'magnets') {
                        prop = 'position';
                        var len = activeItem.selectedLayers.length;
                        for (var i = 0; i < len - 1; i++) {

                            nextLayer = activeItem.selectedLayers[i + 1].name;
                            activeItem.selectedLayers[i].property(prop).expression = 'transform.rotation = transform.' + prop + ' - thisComp.layer("' + nextLayer + '").transform.' + prop + ';';
                        }

                    } else if (textValue == 'cloth') {
                        var cloth = activeItem.selectedLayers;
                        cloth[0].property("rotation").expression = 'd = toComp(anchorPoint)-toComp(anchorPoint,time-.1);(d[0]+d[1]);';
                        if (check) {
                            cloth[1].property("rotation").expression = 'parent.rotation.valueAtTime(time-.2);';
                        }
                    } else if (textValue == 'orphan') {

                        for (var i = 0; i <= len; i++) {
                            activeItem.selectedLayers[i].parent = activeItem.layer('None');
                        }
                    } else if (textValue == 'eye') {

                        if (activeItem.selectedLayers.length < 2) {
                            alert("Select 2 layers in the active comp first.", scriptName);

                        } else {

                            activeItem.selectedLayers[0].name = orientation + " iris";
                            activeItem.selectedLayers[1].name = orientation + " eyeball";
                            activeItem.selectedLayers[0].parent = activeItem.selectedLayers[1];
                            activeItem.selectedLayers[1].property("rotation").expression = 'L = thisComp.layer("' + orientation + ' iris gem"); P = fromWorld(L.toWorld(L.anchorPoint)); V = P - anchorPoint; if (V[0] > 0){ radiansToDegrees(Math.atan2(V[1],V[0])); }else{ radiansToDegrees(Math.atan2(V[1],V[0])) + 360; }';
                            activeItem.selectedLayers[0].property("position").expression = 'transform.position = transform.position -thisComp.layer("' + orientation + ' iris gem").transform.rotation/2;';
                            gemCont = activeItem.layers.addSolid([Math.random(), Math.random(), Math.random()], orientation + " iris gem", 50, 50, 1);
                            gemCont.property("opacity").setValue([50]);
                            gemCont.guideLayer = true;
                            gemCont.property("rotation").setValue([90]);
                            gemCont.property("scale").expression = "[" + gemSize + "," + gemSize + "]";
                        }

                    }
                }
            } else if (my_palette.grp.cmds.dropDown.items[4].selected) {


                if (textValue == 'add_gems') {

                    for (var b = 0; b < 5; b++) {

                        gemCont = activeItem.layers.addSolid([Math.random(), Math.random(), Math.random()], " random gem", 50, 50, 1);
                        gemCont.property("opacity").setValue([50]);
                        gemCont.guideLayer = true;
                        gemCont.property("position").setValue([Math.random() * 200 + 100 * b, Math.random() * 200 + 100 * b]);
                        gemCont.property("rotation").setValue([45]);
                        if (check) {
                            gemCont.property("scale").expression = "[" + gemSize + "," + gemSize + "]";
                        }
                    }
                }
                if (textValue == 'Handfull of gold') {

                    for (var gold = 0; gold < 5; gold++) {
                        gemCont = activeItem.layers.addSolid([1.0, 1.0, 0], "gold", 50, 50, 1);
                        gemCont.property("opacity").setValue([50]);
                        gemCont.guideLayer = true;
                        gemCont.property("position").setValue([Math.random() * 200 + 100 * gold, Math.random() * 200 + 100 * gold]);
                        gemCont.property("rotation").setValue([45]);
                        if (check) {
                            gemCont.property("scale").expression = "[" + gemSize + "," + gemSize + "]";
                        }
                    }

                }
                if (textValue == 'Cthulhu') {

                    gemCont = activeItem.layers.addSolid([0, 0, 0], "obsidian", 50, 50, 1);
                    gemCont.property("opacity").setValue([50]);
                    gemCont.guideLayer = true;
                    gemCont.property("rotation").setValue([45]);
                    gemCont.property("Effects").addProperty("Slider Control").name = "Power";

                    if (check) {
                        gemCont.property("scale").expression = "[" + gemSize + "," + gemSize + "]";
                    }
                }
                if (textValue == 'add_Control') {

                    gemCont = activeItem.layers.addSolid([1, 1, 1], "diamond", 50, 50, 1);
                    gemCont.property("opacity").setValue([50]);
                    gemCont.guideLayer = true;
                    gemCont.property("rotation").setValue([45]);
                    gemCont.property("Effects").addProperty("Slider Control").name = "Ampletude";
                    gemCont.property("Effects").addProperty("Slider Control").name = "Frequancy";
                    gemCont.property("Effects").addProperty("Slider Control").name = "Speed";
                    gemCont.property("Effects").addProperty("Slider Control").name = "Damping";
                    if (check) {
                        gemCont.property("scale").expression = "[" + gemSize + "," + gemSize + "]";
                    }

                }
                if (textValue == 'gem') {

                    gemCont = activeItem.layers.addSolid([Math.random(), Math.random(), Math.random()], " gem", 50, 50, 1);
                    gemCont.property("opacity").setValue([50]);
                    gemCont.guideLayer = true;
                    gemCont.property("rotation").setValue([45]);
                    if (check) {
                        gemCont.property("scale").expression = "[" + gemSize + "," + gemSize + "]";
                    }

                }
                if (textValue == '' || textValue == "addNull") {
                    var selectedLayers = activeItem.selectedLayers;
                    //create null

                    var nullgem = activeItem.layers.addNull();

                    for (var i = 0; i < selectedLayers.length; i++) {
                        selectedLayers[i].parent = app.project.activeItem.layer(1);


                    }


                }
                if (textValue == 'help') {

                    alert('List of gem commands:\n\ngem\nadd_Control\nadd_gems \nHandfull of gold\nCthulhu\n*Void=Null', scriptName);
                } else {
                    var firstLayer;
                    if (orientation == 'l') {

                        for (var k = 0; k < textValue; k++) {

                            firstLayer = activeItem.layer(k + 1);
                            firstLayer.locked = false;
                        }
                    } else if (orientation == 'r') {

                        var q;
                        check ? q = parseInt(textValue) + 4 : q = gemSize;
                        for (var m = parseInt(textValue) - 1; m < parseInt(q); m++) {

                            firstLayer = activeItem.layer(m + 1);
                            firstLayer.locked = false;
                        }
                    }
                }


            } else if (my_palette.grp.cmds.dropDown.items[5].selected) {

                var len = activeItem.selectedLayers.length;
                var gemAlign = activeItem.selectedLayers[0];
                var gemAlignName = gemAlign.name;



                for (var i = 1; i < len; i++) {
                    var len = activeItem.selectedLayers.length;
                    var gemAlign = activeItem.selectedLayers[0];
                    var alignNumCheck = i;
                    var gemAlignName = gemAlign.name;

                    gemAlign.property("Effects").addProperty("Checkbox Control").name = "Align" + " " + alignNumCheck + " " + textValue;
                    activeItem.selectedLayers[i].property("opacity").expression = 'aligment = thisComp.layer("' + gemAlignName + '").effect("Align' + ' ' + i + ' ' + textValue + '")("Checkbox");x = 0;transform.opacity =x;aligment == 1 ? x = 100: x = 0;';

                }


            } else if (my_palette.grp.cmds.dropDown.items[6].selected) {
                if (activeItem.selectedLayers.length <= 0) {
                    alert("Select atleast one shape layer", scriptName);
                } else {

                    explode();


                    //                var myLayers = app.project.activeItem.selectedLayers;
                    //                var myLayer;
                    //                for (var i = 0; i < myLayers.length; i++) {
                    //                    myLayer = myLayers[i];
                    //                    if (myLayer instanceof ShapeLayer) {
                    //                        var myContents = myLayer.property("Contents");
                    //                        for (var j = 1; j <= myContents.numProperties; j++) {
                    //                            var newLayer = app.project.activeItem.addShape();
                    //                            
                    //                          var props = myContents.property(j);
                    //                         // newLayer.property("Contents").addProperty(myContents.property(j););
                    //myContents.property(j).property("Transform").property("Position").expression = codeValue;
                    //                        }
                    //                    }
                    //                }
                }
            } else if (my_palette.grp.cmds.dropDown.items[7].selected) {
                if (orientation == 'l') {
                    if (activeItem.layer("size specs")) {
                        activeItem.layer("size specs").remove();
                    }

                    try {
                        var spec = [];
                        var string = "";
                        var x;
                        var text = activeItem.layers.addText("Layers ");
                        for (var i = 1; i < activeItem.layers.length; i++) {
                            if (i == 1) {
                                continue;
                            } else if (i == 2) {
                                x = "thisComp.layer(" + i + ").name + ':' + ' ' + 'X ' + Math.round((thisComp.layer(" + i + ").transform.scale[0]*thisComp.layer(" + i + ").width/100)) + ' '+ 'Y ' + Math.round((thisComp.layer(" + i + ").transform.scale[1]*thisComp.layer(" + i + ").height/100)) +  '\\n'";
                            } else {
                                x = "+ thisComp.layer(" + i + ").name + ':' + ' ' + 'X ' + Math.round((thisComp.layer(" + i + ").transform.scale[0]*thisComp.layer(" + i + ").width/100)) + ' '+ 'Y ' + Math.round((thisComp.layer(" + i + ").transform.scale[1]*thisComp.layer(" + i + ").height/100)) + '\\n'";
                            }

                            spec.push(x);

                        }
                        for (var j = 0; j <= spec.length - 1; j++) {
                            string += spec[j];
                        }
                        text.sourceText.expression = string + ";";
                        var newTxt = text.sourceText.value;
                        var inspector = activeItem.layers.addText(newTxt);
                        text.remove();
                        inspector.position.setValue([10, 50]);
                        inspector.name = "size specs";

                    } catch (e) {
                        alert(e.toString() + "\nError on line: " + e.line.toString());
                    }



                } else if (orientation == 'r') {
                    if (activeItem.layer("parent specs")) {
                        activeItem.layer("parent specs").remove();
                    }

                    try {
                        var spec = [];
                        var string = "";
                        var x;
                        var text = activeItem.layers.addText("Layers ");
                        var firstParent = false;
                        for (var i = 1; i < activeItem.layers.length; i++) {

                            if (i == 1) {
                                continue;
                            } else if (!activeItem.layer(i).parent) {
                                continue;
                            } else if (i >= 2 && !firstParent) {


                                x = "thisComp.layer(" + i + ").name + '`s' + ' ' + 'parent is ' + thisComp.layer(" + i + ").parent.name +  '\\n'";
                                firstParent = true;
                            } else if (firstParent) {
                                x = "+ thisComp.layer(" + i + ").name + '`s' + ' ' + 'parent is ' + thisComp.layer(" + i + ").parent.name +  '\\n'";
                            }

                            spec.push(x);

                        }
                        for (var j = 0; j <= spec.length - 1; j++) {
                            string += spec[j];
                        }
                        text.sourceText.expression = string + ";";
                        var newTxt = text.sourceText.value;
                        var inspector = activeItem.layers.addText(newTxt);
                        text.remove();
                        inspector.position.setValue([350, 50]);
                        inspector.name = "parent specs";

                    } catch (e) {
                        alert(e.toString() + "\nError on line: " + e.line.toString());
                    }
                }

            } else if (my_palette.grp.cmds.dropDown.items[8].selected) {

                if (check) {
                    if (orientation == "l") {
                        var props = activeItem.selectedLayers;
                        for (var n = 0; n < props.length; n++) {
                            props[n].property("position").expression = codeValue;
                        }
                    } else if (orientation == "r") {
                        var props = activeItem.selectedLayers;
                        for (var n = 0; n < props.length; n++) {
                            props[n].property("rotation").expression = codeValue;
                        }
                    }
                } else if (!check) {

                    var props = activeItem.selectedProperties;
                    for (var n = 0; n < props.length; n++) {
                        props[n].expression = codeValue;
                    }
                }


            } else if (my_palette.grp.cmds.dropDown.items[9].selected) {
                if (!check) {
                    alert('Combinations:\n\nfx + ♦ (Limbs) = add gem to anchor point.  \nfx + ♦ (Tools) = add scale [100,100] lock.\nR + ♦ (Limbs) = leg\nL + ♦ (Limbs) = arm.\nR (Misc, Eye) = r\nL  (Misc, Eye) = l.\n*void* + L + number + ♦(Tools) = unlock n number of layers.\n*void* + R + number + ♦(Tools) + (fx) = unlock from text to gemSize(5) number of layers\nselectedLayers(controler first) + ♦ (Overlap) = checkbox turns visable(invisable).\ntext = cloth + (fx) (Misc)(add chain rotation).\ntext *void*(addNull) = (Tools) + ♦ = add null + parent selected to it\nfx + L(R) + ♦ (Limbs) = add IK to mirrored layers. \ntext + fx + L(R) + ♦(Misc)=rename selectedLayers(add index) & if gem(+) = add names.\n♦ + *void*(Inspect) + L(R) =  inspects parenting structure(real scale value) of layers and creates text layers with that info.\n text = command + ♦(Tools) = summons controlers.\n ♦ (CodeEditor) = adds code editor for expressions at selected property & if fx(checked) = l for position and r for rotation.', scriptName + ' Combos');
                } else if (check) {
                    alert('The script names layers (there is a text input field which also can receive commands), parents layers, creates controls, \n\ninserts Inverse Kinematics (ideal tool for character animations), creates a procedural animation with lots of expression controls for adjusting it, cloth simation, lots of other riging mechanics (like eye rig, head rig, tail rig, etc.) \n \nand very useful tools like auto unlocker and parent selected layers to null.', scriptName + ' ' + 'Brief');
                }
            }
            app.endUndoGroup();
        }

        // UI stuff
        function BuildAndShowUI(thisObj) {
            // Create and show a floating palette.
            var my_palette = (thisObj instanceof Panel) ? thisObj : new Window("palette", scriptName, undefined, {
                resizeable: true
            });
            if (my_palette != null) {

                var res =
                    "group { \
						orientation:'column', alignment:['fill','top'], alignChildren:['left','top'], spacing:5, margins:[0,0,0,0], \
						optsRow: Group { \
							orientation:'row', alignment:['fill','top'], \
							centerButton: RadioButton { text:'L', alignment:['fill','center'], value:'true' }, \
							cornerButton: RadioButton { text:'R', preferredSize:[30,20], alignment:['fill','center'] }, \
                            fcheck: Checkbox { text:'fx', alignment:['fill','center'] }, \
                            text_Size: EditText { text:'100', alignment:['fill','center'], preferredSize:[30,20] }, \
						}, \
						cmds: Group { \
							orientation:'column', alignment:['fill','top'], \
							text_input: EditText { text:'', alignment:['fill','center'], preferredSize:[80,20], }, \
                            okButton: Button { text:'  ♦  ', alignment:['fill','center'] }, \
							dropDown: DropDownList {properties:{items:['Limb','Fingers', 'Breath','Misc','Tools','Overlap','Release Shapes','Inspect','CodeEditor', 'Help'], alignment:['fill','center'] }, preferredSize:[-1,20]},\
						}, \
					}";

                var codeField =
                    "group { \
						orientation:'column', alignment:['fill','center'], alignChildren:['fill','center'], spacing:5, margins:[0,0,0,0], \
						cmds: Group { \
							orientation:'column', alignment:['fill','center'], \
							text_input: EditText {properties:{multiline: true, resizeable:true }, text:'', alignment:['fill','center'], preferredSize:[250,250] }, \
						}, \
					}";

                my_palette.margins = [10, 10, 10, 10];
                my_palette.grp = my_palette.add(res);
                var codeEdit = new Window("palette", scriptName + "++", undefined, {
                    resizeable: true
                });

                function codeEditor() {
                    if (my_palette.grp.cmds.dropDown.items[8].selected) {
                        my_palette.grp2 = codeEdit.add(codeField);
                        codeEdit.show();
                        my_palette.grp2.cmds.text_input.onChange = on_codeEdit_changed;
                        my_palette.onResizing = my_palette.onResize = function () {
                            this.layout.resize();
                        }

                    }

                }

                //fixing problems with legacy style UI
                var winGfx = my_palette.graphics;
                var darkColorBrush = winGfx.newPen(winGfx.BrushType.SOLID_COLOR, [0, 0, 0], 1);
                my_palette.grp.optsRow.cornerButton.onClick = onCornerButtonClick;
                my_palette.grp.optsRow.centerButton.onClick = onCenterButtonClick;
                my_palette.grp.optsRow.fcheck.onClick = checkbox;
                my_palette.grp.optsRow.text_Size.onChange = on_textSize_Input_changed;
                my_palette.grp.cmds.text_input.graphics.foregroundColor = darkColorBrush;
                my_palette.grp.cmds.dropDown.onChange = codeEditor;


                my_palette.grp.cmds.text_input.onChange = on_textInput_changed;
                my_palette.grp.cmds.okButton.onClick = onAssembleClick;
                my_palette.onResizing = my_palette.onResize = function () {
                    this.layout.resize();
                }
            }
            return my_palette;
        }

        if (parseFloat(app.version) < 8) {
            alert("This script requires After Effects CS3 or later.", scriptName);
            return;
        }

        var my_palette = BuildAndShowUI(thisObj);
        my_palette.grp.cmds.dropDown.selection = 0;
        if (my_palette != null) {
            if (my_palette instanceof Window) {
                my_palette.center();
                my_palette.show();
            } else {
                my_palette.layout.layout(true);
                my_palette.layout.resize();
            }

        } else {
            alert("Could not open the user interface.", scriptName);
        }
    }

    AssembleSelectedLayers(this);

}
