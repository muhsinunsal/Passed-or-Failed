
const course_i = document.getElementById("course");
const s2 = document.getElementById("s2");
const s3 = document.getElementById("s3");
const lastUpdateElement = document.getElementById("lastUpdate");


fetch('./data.json')
  .then((response) => response.json())
  .then((json) => {
    const updateDate = json[0];
    json.shift();
    lastUpdateElement.innerText = updateDate.substr(4);
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
      s2.innerHTML = "";
      //totalGrade = `Your grade is: ${result}`

      const course = json.find(course => course.shortName == course_i.value);
      if (course_i.value == "") {
        const courseTotal = document.createElement("h2");
        courseTotal.innerText = `Please start with choosing course you're taking`;
        s2.appendChild(courseTotal);
      } else if (course == undefined) {
        const courseTotal = document.createElement("h2");
        courseTotal.innerText = `Course not found`;
        s2.appendChild(courseTotal);

      } else {
        const gradings = course.gradings;
        console.log(course.shortName, course.fullName);
        if (gradings.length == 0) {
          const noGradingFound = document.createElement("h2");
          noGradingFound.innerText = "There is no data associated with this course.";
          s2.appendChild(noGradingFound);
          //////////////////////////////////////////////////
        } else {
          for (const grading of gradings) {
            grading.type = formatGradingType(grading.type);
            //////////////////////////////
            const grading_stack = document.createElement("ol");
            grading_stack.setAttribute("class", "grading_Stack");
            grading_stack.setAttribute("id", `grading_Stack_${grading.type}`);
            const typeElement = document.createElement("span");
            typeElement.innerText = `${grading.type} (${grading.percentage}%)`;
            grading_stack.appendChild(typeElement);
            grading.type = grading.type.toLowerCase();

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

              if (i != 0) { // Not Suprame input
                grading_input.addEventListener("change", () => calculateCourseTotal(gradings))
              } else {// Suprame input
                grading_input.addEventListener("change", () => {
                  console.log("Suprame input changed!")
                  console.log(gradings)
                })
              }

              label.appendChild(grading_input);
              grading_stack.appendChild(label);
            }
            s2.appendChild(grading_stack);
          }
        }
      }

    });
  });


function calculateCourseTotal(gradings) {

  //Form an array
  const batchArrays = [];
  for (const grading of gradings) {
    const inputArray = [];
    for (let i = 1; i < grading.number + 1; i++) {
      inputArray.push(document.getElementById(`${grading.type}_${i}`));
    }
    batchArrays.push({ suprame: document.getElementById(`${grading.type}_${0}`), inputArray, percentage: grading.percentage });
  }

  //Calculate suprame inputs value 
  for (let i = 0; i < batchArrays.length; i++) {
    //Low Level
    let currentSum = 0;
    for (let j = 0; j < batchArrays[i].inputArray.length; j++) {

      const obj = batchArrays[i].inputArray[j];
      currentSum += Number(obj.value);
    }
    batchArrays[i].suprame.value = currentSum / batchArrays[i].inputArray.length;
  }

  let finalSum = 0;

  for (let i = 0; i < batchArrays.length; i++) {
    batchArray = batchArrays[i];
    finalSum += batchArray.suprame.value * batchArray.percentage / 100;
  }

  s3.innerHTML = "";

  const courseTotal = document.createElement("h2");
  courseTotal.innerText = `Total point is: ${Math.round(finalSum * 100) / 100}`;
  s3.appendChild(courseTotal);
}

function formatGradingType(string) {
  switch (string) {
    case "Attendance/Participation":
      return "Attendance";
      break;
    case "Field Work":
      return "FieldWork";
      break;
    case "Special Course Internship":
      return "Internship";
      break;
    case "Quizzes/Studio Critics":
      return "Quizzes";
      break;
    case "Homework Assignments":
      return "Assignments";
      break;
    case "Midterms Exams/Midterms Jury":
      return "Midterms";
      break;
    case "Final Exam/Final Jury":
      return "Final";
      break;
    case "Presentation":
    case "Project":
    case "Report":
    case "Seminar":
    case "Laboratory":
    case "Application":
      return string;
      break;
    default:
      console.error("Unkown grading type")
      return undefined
      break;
  };
}