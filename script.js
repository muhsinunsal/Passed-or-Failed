
const course_i = document.getElementById("course");
const s2 = document.getElementById("s2");
const lastUpdateElement = document.getElementById("lastUpdate");

let result = 0;

fetch('./data.json')
  .then((response) => response.json())
  .then((json) => {
    const updateDate = json[0];
    json.shift();
    lastUpdateElement.innerHTML = updateDate.substr(4);
    //Fill the selector input
    for (const data of json) {
      const course = data;
      const option = document.createElement("option");
      option.setAttribute("value", course.shortName);
      option.innerHTML = course.fullName;
      document.getElementById("courses").appendChild(option);
    }

    //let totalGrade = document.getElementById("totalgrade").innerHTML = `Your grade is: ${result}`;

    course_i.addEventListener("change", () => {
      result = "-";
      s2.innerHTML = "";
      //totalGrade = `Your grade is: ${result}`

      const course = json.find(course => course.shortName == course_i.value);
      const gradings = course.gradings;
      console.log(course.shortName, course.fullName);
      console.log(gradings)
      for (const grading of gradings) {
        const grading_stack = document.createElement("ol");
        grading_stack.setAttribute("class", "grading_Stack");
        grading_stack.setAttribute("id", `grading_Stack_${grading.type}`)
          ;
        const typeElement = document.createElement("u");
        typeElement.innerText = `${grading.type} (${grading.percentage}%)`;
        grading_stack.appendChild(typeElement);

        for (let i = 0; i < grading.number + 1; i++) { // Added +1 for supreme input 
          const label = document.createElement("label");
          if (i == 0) {
            label.setAttribute("class", "supreme");
          } else if (grading.number == 1) {
            label.setAttribute("class", "single");
          } else if (grading.number == 1 && grading.number == 0) {
            label.setAttribute("class", "single supreme");
          }

          const grading_input = document.createElement("input");
          grading_input.setAttribute("class", "grading_Input");
          grading_input.setAttribute("type", "number");
          grading_input.setAttribute("id", `${grading.type.toLowerCase()}_${i}`);

          label.appendChild(grading_input);
          grading_stack.appendChild(label);
        }
        s2.appendChild(grading_stack)




        /*let td1 = document.createElement("td");
        td1.setAttribute("id", grading);
        td1.innerHTML = `${grading.type} (${grading.percentage}%)`;
        row1.appendChild(td1);

        let td2 = document.createElement("td");
        td2.setAttribute("id", `${grading.type}_i`);
        let input = document.createElement("input");
        input.setAttribute("type", "number");
        input.setAttribute("id", `${grading.type}_i`);
        input.addEventListener("change", () => {
          result += (input.value * grading.percentage) / 100;
          //totalGrade = `Your grade is: ${result}`;
        });
        td2.appendChild(input);
        row2.appendChild(td2);*/
      }
    });



  });


