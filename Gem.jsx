var s = function (sketch) {
    p5.disableFriendlyErrors = true;
    let px, py, wide, heigh, time, value, r1, r2, a, b, decay, start, sign, lx, ly, ink, count, ready, speed, counting, number, numLoop, smooth, smoothedX, smoothedY,nameId,counterNum, drawPath,singleMode,mX,mY,keyCounter,check;
    let Connect=[];
    const stopwatchIcon = String.fromCharCode(0x23F1);
    let ConnectX=[];
    let ConnectY=[];    
    
    let Xi=0;
    let Yi=0;
    let inkPress = 1;
    let bgcolor = [255, 250, 250];
    let keyFrameX = [];
    let keyFrameY = [];
    let bgAlpha = 0.1;
    let timeStored = [];
    let startA;
    let rotationData = [];
    let canvas = document.getElementById('main-canvas');
    let width = canvas.width;
    let height = canvas.height;
   let singlePath = [];
    let xval = [];
    let yval = [];


    sketch.setup = function () {
        counting = false;
        number = 0;
        keyCounter=0;
     
        sketch.createCanvas(width, height);
        lx = px;
        ly = py;

        time = 0;
        count = 0;
        ready = false;

        start = false;

        ink = 0;


        let h = document.body.clientHeight;
        let c = sketch.createCanvas(sketch.windowWidth, h);
        c.position(0, 0);
        c.style('pointer-events', 'none');
        c.style('z-index', '+1');
        sketch.clear();




    }
    var draw = false;
    var lock = true;



    sketch.draw = function () {

        //displayText();
        signatureDraw(10);

        Animation();
        sketch.stroke(0);
        sketch.strokeWeight(1);

    }

    

sketch.mouseDragged  = function(){
             sketch.clear();
        for(let i = 0; i<=ConnectX.length-1; i++){
            sketch.stroke(255,123,123);
//            sketch.line(singlePath[singlePath.length-(i+1)],singlePath[singlePath.length-i],singlePath[singlePath.length-(i+3)],singlePath[singlePath.length-(i+2)], 5);
            
//              sketch.line(Connect[Connect.length-i], Connect[ Connect.length-(i+1)], Connect[ Connect.length-(i+2)], Connect[ Connect.length-(i+3)], 5);
           
              sketch.line(
                  ConnectX[ConnectX.length-i],
                    ConnectY[ConnectY.length-i],
                          ConnectX[ConnectX.length-(i+1)], 
                              ConnectY[ConnectY.length-(i+1)],
                  5);
            sketch.noStroke();
//            sketch.ellipse(Connect[Connect.length-i], Connect[ Connect.length-(i+1)], 5);
              sketch.ellipse(ConnectX[ConnectX.length-i], ConnectY[ ConnectY.length-i], 5);
        }
          
        sketch.stroke(255,123,123);
    //Connect.push(mY,mX);
          ConnectX.push(mX);
            ConnectY.push(mY);
//  console.log(" X "+ Connect[Connect.length-1]+" Y "+ Connect[Connect.length-2]);
//            sketch.line(Connect[Connect.length-1],Connect[Connect.length-2], sketch.mouseX, sketch.mouseY, 5);
            sketch.line(ConnectX[ConnectX.length-1],ConnectY[ConnectY.length-1], sketch.mouseX, sketch.mouseY, 5);
           // sketch.line(mX, mY, sketch.mouseX, sketch.mouseY, 5);
            sketch.noStroke();
            sketch.ellipse(mX, mY, 5);

    
}
    
    
    
    function Animation() {


        if (number > keyFrameX.lenght && counting) {
            numLoop = true;
        } else if (number < keyFrameX.length && !counting) {

            numLoop = false;
        }
        if (counting) {
            number += 0.2;
        }
        smoothOut(keyFrameX, 0.80);
        smoothOut(keyFrameY, 0.80);


        smoothedX = keyFrameX;
        smoothedY = keyFrameY;

        
        
        if(!singleMode){
            sketch.fill(49, 242, 136);
        sketch.ellipse(smoothedX[Math.round(number)], smoothedY[Math.round(number)], 5);
        sketch.ellipse(smoothedX[Math.round(number)], smoothedY[Math.round(number)], 5);   
        }else{
            //sketch.clear();
           // sketch.line(mX, mY, sketch.mouseX, sketch.mouseY, 5);
             
//            sketch.strokeWeight(3);
//           
//            for(let z = 0; z<=1; z+=0.001){
//                sketch.noStroke();
//            sketch.fill(0, (z * 1000) , 0,z);
//            sketch.ellipse(mX,mY,(40*z));
//            }
    
            sketch.noFill();
            sketch.strokeWeight(3);
            sketch.stroke(245, 24, 169);
            sketch.ellipse(mX,mY,20);
            sketch.fill(49, 242, 136);
            sketch.noStroke();
            sketch.ellipse(mX, mY, 5);
            
        }
    }

    function signatureDraw(val = 0) {
        let numKeyFrames = 60;
        if (start) {

            time += 1 / numKeyFrames;
            //time+=numKeyFrames;
            timeStored.push(time.toFixed(2));
        } else {

            time = 0;
            ink = 0;

        }
        r1 = 30;
        r2 = 30;
        decay = 0.5;
        ink = 160;
        ink--;


        px = sketch.mouseX;
        py = sketch.mouseY;



        sign = new Signature(px, py, lx, ly, ink, val);

        if (ready && startA) {

            sketch.stroke(245, 24, 169, ink);
            sign.drawLine();

        } else {

            sign.stopDraw();
            sign = null;

        }
        lx = px;
        ly = py;

    }

    sketch.keyPressed = function () {
        let text = [];
        if (sketch.keyCode === 51) {
            //Preview motion  Press 3 to activate
            counting = true;

        }else if(sketch.keyCode === 13){
            //num Enter for signle frame insertion
                check = true;
               nameId = prompt("enter id", "ikcontroller-l,ikcontroller-r,ikcontroller-ar,ikcontroller-al,ikcontroller-body");
                counterNum = prompt(stopwatchIcon, "0.5")
        }
        
        
        
        else if (sketch.keyCode === 50) {
            //basic save of motion data Press 2 to activate
            counting = false;
            number = 0;

            let xmls;
            let Keys = prompt("enter number of keyframes", "5");
            nameId = prompt("enter id", "ikcontroller-l,ikcontroller-r,ikcontroller-ar,ikcontroller-al,ikcontroller-body");
            startA = false;

            parseFloat(xval);
            parseFloat(yval);
            smoothOut(xval, 0.80);
            smoothOut(yval, 0.80);

            for (let i = 1; i <= timeStored.length - 1; i++) {
                if (i % parseInt(Keys) == 0) {
                    xmls = `<animation id="move-` + nameId + i + `" type="basicMove" object="` + nameId + `" positionStart="` + ((parseFloat(xval[i - 1]) / 100)) + `:` + ((parseFloat(yval[i - 1]) / 100)) + `" positionEnd="` + ((parseFloat(xval[i]) / 100)) + `:` + ((parseFloat(yval[i]) / 100)) + `" positionRelativeTo="scene" startTime="` + timeStored[i - 1] + `" endTime="` + timeStored[i + (parseInt(Keys) - 1)] + `"/>`;

                    text.push(xmls);
                }

            }


            console.log(`

<!--********************************************************

keyframes of ${nameId} position generated with Moution Path

**********************************************************--> 


${text.join("\n")}`);


        } else if (sketch.keyCode == 49) {
            //Start recording motion data Press 1 to activate
            singleMode = false;
            startA = true;
            drawPath = true;
        } else if (sketch.keyCode == 97) {
            //checkpoint
            //Start recording motion data Press num 1 to activate 
            //First  press 1 then click and move then release then press 0  
            if(check){
            keyCounter+=parseFloat(counterNum);
            mX=sketch.mouseX;
            mY=sketch.mouseY;  
            singleMode = true;
            startA = true;
            drawPath = false;
            check=false;
            }else if(!check){
            startA = true;
            drawPath = false;
            }
           
           
        
            
        } else if (sketch.keyCode == 110) {
            //delete motion data   Press .del num to activate
            xval = [];
            yval = [];
            timeStored = [];

        } else if (sketch.keyCode == 88) {

            //x only where you lock y  Press X to activate
            counting = false;
            number = 0;
            let xmls;
            let Keys = prompt("enter number of keyframes", "5");

           nameId = prompt("enter id", "ikcontroller-l,ikcontroller-r,ikcontroller-ar,ikcontroller-al,ikcontroller-body");
            startA = false;

            parseFloat(xval);
            parseFloat(yval);
            smoothOut(xval, 0.80);
            smoothOut(yval, 0.80);

            for (let i = 1; i <= timeStored.length - 1; i++) {

                if (i % parseInt(Keys) == 0) {
                    xmls = `<animation id="move-` + nameId + i + `" type="basicMove" object="` + nameId + `" positionStart="` + ((parseFloat(xval[i - 1]) / 100)) + `:` + ((parseFloat(yval[0]) / 100)) + `" positionEnd="` + ((parseFloat(xval[i]) / 100)) + `:` + ((parseFloat(yval[0]) / 100)) + `" positionRelativeTo="scene" startTime="` + timeStored[i - 1] + `" endTime="` + timeStored[i + (parseInt(Keys) - 1)] + `"/>`;

                    text.push(xmls);

                }
            }


            console.log(`

<!--********************************************************

keyframes of ${nameId} position only X axis generated with Moution Path

**********************************************************--> 


${text.join("\n")}`);



        } else if (sketch.keyCode == 89) {
            //y only where you lock x   Press Y to activate
            counting = false;
            number = 0;
            let xmls;
            let Keys = prompt("enter number of keyframes", "5");
             nameId = prompt("enter id", "ikcontroller-l,ikcontroller-r,ikcontroller-ar,ikcontroller-al,ikcontroller-body");
            startA = false;

            parseFloat(xval);
            parseFloat(yval);
            smoothOut(xval, 0.80);
            smoothOut(yval, 0.80);

            for (let i = 1; i <= timeStored.length - 1; i++) {

                if (i % parseInt(Keys) == 0) {
                    xmls = `<animation id="move-` + nameId + i + `" type="basicMove" object="` + nameId + `" positionStart="` + ((parseFloat(xval[0]) / 100)) + `:` + ((parseFloat(yval[i - 1]) / 100)) + `" positionEnd="` + ((parseFloat(xval[0]) / 100)) + `:` + ((parseFloat(yval[i]) / 100)) + `" positionRelativeTo="scene" startTime="` + timeStored[i - 1] + `" endTime="` + timeStored[i + (parseInt(Keys) - 1)] + `"/>`;

                    text.push(xmls);
                }

            }


            console.log(`

<!--********************************************************

keyframes of ${nameId} position only Y axis generated with Moution Path

**********************************************************--> 


${text.join("\n")}`);


        } else if (sketch.keyCode == 80) {
            //copy previous data with offset Press P to activate

            counting = false;
            number = 0;

            let xmls;
            let Keys = prompt("enter number of keyframes", "5");
            nameId = prompt("enter id", "ikcontroller-l,ikcontroller-r,ikcontroller-ar,ikcontroller-al,ikcontroller-body");
            let offX = prompt("enter offset value X ", "0.5");
            let offY = prompt("enter offset value Y ", "0.5");


            startA = false;

            parseFloat(xval);
            parseFloat(yval);
            smoothOut(xval, 0.80);
            smoothOut(yval, 0.80);

            for (let i = 1; i <= timeStored.length - 1; i++) {
                if (i % parseInt(Keys) == 0) {
                    if (timeStored[i] == -1) {
                        timeStored[i] = 0;
                    }
                    xmls = `<animation id="move-` + nameId + i + `" type="basicMove" object="` + nameId + `" positionStart="` + ((parseFloat(xval[i - 1]) / 100) + parseFloat(offX)) + `:` + ((parseFloat(yval[i - 1]) / 100) + parseFloat(offY)) + `" positionEnd="` + ((parseFloat(xval[i]) / 100) + parseFloat(offX)) + `:` + ((parseFloat(yval[i]) / 100) + parseFloat(offY)) + `" positionRelativeTo="scene" startTime="` + timeStored[i - 1] + `" endTime="` + timeStored[i + (parseInt(Keys) - 1)] + `"/>`;

                    text.push(xmls);

                }
            }


            console.log(`

<!--********************************************************

keyframes of ${nameId} position previous data with offset generated with Moution Path

**********************************************************--> 


${text.join("\n")}`);








        } else if (sketch.keyCode == 82) {
            //basic save of motion data rotation Press R to activate

            nameId = prompt("enter id", "ikcontroller-l,ikcontroller-r,ikcontroller-ar,ikcontroller-al,ikcontroller-body");
            let anchorX = prompt("enter X anchor point");
            let anchorY = prompt("enter Y anchor point");

            startA = true;

            let rotationA;
            let rotationB;



            sketch.mouseReleased = function () {
//     
//                mX=null;
//                mY=null;
                rotationA = rotationData[0];
                rotationB = rotationData[rotationData.length - 1];
                startA = false;
                counting = false;
                number = 0;
                let xmlA;
                let xmlB;

                xmlA = `<animation id="rotate--` + nameId + `" type="basicRotate|angle:` + parseFloat(rotationB) + `;ease:linear;anchorPoint:` + parseFloat(anchorX) + `,` + parseFloat(anchorY) + `;revertAnchor:false" object="` + nameId + `" positionStart="center:center" positionEnd="center:center" positionRelativeTo="scene" startTime="` + timeStored[0] + `" endTime="` + timeStored[timeStored.length - 1] + `"/>`;

                //text.push(xmlA,xmlB);
                // }

                //}


                console.log(`

<!--********************************************************

keyframes of ${nameId} rotation generated with Moution Path

**********************************************************--> 


${xmlA}`);

            }





        } else if (sketch.keyCode == 96) {
            drawPath = true;
            //sigle keyframe pos press Num 0 for move
            counting = false;
            number = 0;
            check = true;
            let xmls;
//            let time1 = prompt("time start");
//            let time2 = prompt("time end");
            
            let time1;
            let time2;
          
            startA = false;

            parseFloat(xval);
            parseFloat(yval);
            smoothOut(xval, 0.80);
            smoothOut(yval, 0.80);
            
            xmls = `<animation id="move-` + nameId + `" type="basicMove" object="` + nameId + `" positionStart="` + ((parseFloat(xval[Xi]) / 100)) + `:` + ((parseFloat(yval[Yi]) / 100)) + `" positionEnd="` + ((parseFloat(xval[xval.length - 1]) / 100)) + `:` + ((parseFloat(yval[yval.length - 1]) / 100)) + `" positionRelativeTo="scene" startTime="` + keyCounter + `" endTime="` + (keyCounter+parseFloat(counterNum)) + `"/>`;


            console.log(`

<!-- keyframe of ${nameId} Move generated with Moution Path 
${sketch.hour()}.${sketch.minute()}:${sketch.second()} --> 


${xmls}`);
            Xi= xval.length-1;
            Yi= xval.length-1;
            
            
        } else if (sketch.keyCode == 107) {
            //copy previous data with offset Press + num to activate

            counting = false;
            number = 0;

            let xmls;
            let time1 = prompt("time start");
            let time2 = prompt("time end");
            nameId = prompt("enter id", "ikcontroller-l,ikcontroller-r,ikcontroller-ar,ikcontroller-al,ikcontroller-body");
            let offX = prompt("enter offset value X ", "0.5");
            let offY = prompt("enter offset value Y ", "0.5");


            startA = false;

            parseFloat(xval);
            parseFloat(yval);
            smoothOut(xval, 0.80);
            smoothOut(yval, 0.80);


            xmls = `<animation id="move-` + nameId + `" type="basicMove" object="` + nameId + `" positionStart="` + ((parseFloat(xval[0]) / 100) + parseFloat(offX)) + `:` + ((parseFloat(yval[0]) / 100) + parseFloat(offY)) + `" positionEnd="` + ((parseFloat(xval[xval.length - 1]) / 100) + parseFloat(offX)) + `:` + ((parseFloat(yval[yval.length - 1]) / 100) + parseFloat(offY)) + `" positionRelativeTo="scene" startTime="` + parseFloat(time1) + `" endTime="` + parseFloat(time2) + `"/>`;





            console.log(`

<!-- keyframes of ${nameId} Move previous data with offset generated with Moution Path --> 


${xmls}`);



        } else {
            counting = false;
        }
    }
    sketch.mousePressed = function () {
//        console.log(singlePath[singlePath.length-1]+"  "+singlePath[singlePath.length-2]);
//        singlePath.push(Connect[Connect.length-1],Connect[Connect.length-2]);
      
        console.log(`<!--${stopwatchIcon} set:${check}-->`);
        if (startA) {

            count += 1;

            if (count == 2) {

                count = 0;
                start = false;
                ready = false;
                bgAlpha = 12;

            }
            if (count == 1) {
                ready = true;
                start = true;

                bgAlpha = 0.1;

            }
        }
    }




    class Signature {

        constructor(px, py, lx, ly, ink, val) {

            this.px = px;
            this.py = py;
            this.lx = lx;
            this.ly = ly;
            this.ink = ink;
            this.val = val;

        }

        drawLine(val = 0) {
            if (drawPath) {
                inkPress = 1;

                sketch.strokeWeight(inkPress);

                sketch.stroke(245, 24, 169, ink);

                sketch.line(this.px, this.py, this.lx, this.ly);
                sketch.fill(245, 24, 169, ink);
                sketch.ellipse(px, py, 1);
            }
            rotationData.push(document.getElementById('infopanel_rotation').innerText);
            xval.push(document.getElementById('infopanel_leftRel').innerText);
            yval.push(document.getElementById('infopanel_topRel').innerText);
            keyFrameX.push(px);
            keyFrameY.push(py);

        }
        stopDraw() {
            sketch.noStroke();
        }



    }

    function avg(v) {
        return v.reduce((a, b) => a + b, 0) / v.length;
    }

    function smoothOut(vector, variance) {
        var t_avg = avg(vector) * variance;
        var ret = Array(vector.length);
        for (var i = 0; i < vector.length; i++) {
            (function () {
                var prev = i > 0 ? ret[i - 1] : vector[i];
                var next = i < vector.length ? vector[i] : vector[i - 1];
                ret[i] = avg([t_avg, avg([prev, vector[i], next])]);
            })();
        }
        return ret;
    }




    var x = 100;
    var y = 100;


};

var myp5 = new p5(s);
