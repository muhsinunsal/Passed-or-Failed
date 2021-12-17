const MATH151 = {
  proporites: {
    Name: "MATH 151",
    Namefull: "Calculus I",
    Quiz: 7,
    Midterm: 2,
    Kalmasiniri: "Unknown",
  },
  grading_ratios: {
    Midterm_1: 30,
    Midterm_2: 30,
    Final: 40,
    Quiz: 10,
  },
};
const CHE105 = {
  proporites: {
    Name: "CHE 105",
    Namefull: "General Chemistry",
    Laboratory: 6,
    Midterm: 2,
    Kalmasiniri: 50,
  },
  grading_ratios: {
    Midterm_1: 25,
    Midterm_2: 25,
    Final: 35,
    Laboratory: 15,
    Assignment: 10,
  },
};
const PHYS101 = {
  proporites: {
    Name: "PHYS 101",
    Namefull: "General Physics I",
    Laboratory: 5,
    Midterm: 2,
    Kalmasiniri: "Unknown",
  },
  grading_ratios: {
    Midterm_1: 20,
    Midterm_2: 20,
    Final: 25,
    Laboratory: 20,
    Assignment: 15,
  },
};
const ENG101 = {
  proporites: {
    Name: "ENG 101",
    Namefull: "English for Academic Purposes I",
    Midterm: 1,
    Kalmasiniri: null
  },
  grading_ratios: {
    Midterm: 30,
    IT: 20,
    Presentation: 10,
    Final: 40
  }
};
const CMPE109 = {
  proporites: {
    Name: "CMPE 109",
    Namefull: "Fundamentals of Computing",
    Midterm: 1,
    Kalmasiniri: null
  },
  grading_ratios: {
    Midterm: 30,
    Assignment: 20,
    Final: 50
  }
};
const CMPE113 = {
  proporites: {
    Name: "CMPE 113",
    Namefull: "Computer Programming I",
    Midterm: 2,
    Kalmasiniri: null
  },
  grading_ratios: {
    Midterm_1: 40,
    Midterm_2: 40,
    Laboratory: 20,
    Assignment: 10,
    Final: 30
  }
};

const courses = [MATH151, CHE105, PHYS101, ENG101,CMPE109,CMPE113];
courses.sort();

function whatCourse(string) {
  let course;
  switch (string) {
    case "MATH 151":
      course = MATH151;
      break;
    case "CHE 105":
      course = CHE105;
      break;
    case "PHYS 101":
      course = PHYS101;
      break;
    case "ENG 101":
      course = ENG101;
      break;
    case "CMPE 109":
      course = CMPE109;
      break;
    case "CMPE 113":
      course = CMPE113;
      break;
    default:
      console.error("Whatcourse functionuna yanlış string girildi!");
      break;
  }
  return course;
}

for (let i = 0; i < courses.length; i++) {
  const course = courses[i];
  const option = document.createElement("option");
  option.setAttribute("value", course.proporites.Name);
  option.innerHTML = course.proporites.Namefull;
  document.getElementById("courses").appendChild(option);
}

const course_i = document.getElementById("course");

const table = document.createElement("table");
const row1 = document.createElement("tr");
const row2 = document.createElement("tr");
table.appendChild(row1);
table.appendChild(row2);
let result = 0;

course_i.addEventListener("change", () => {
    result = 0;
    document.getElementById("totalgrade").innerHTML = `Your grade is: ${result}`;
    row1.innerHTML = "";
    row2.innerHTML = "";
     

  const courseobj = whatCourse(course_i.value);
  for (let i = 0; i < Object.keys(courseobj.grading_ratios).length; i++) {
    let property = Object.keys(courseobj.grading_ratios)[i];

    let td1 = document.createElement("td");
    td1.setAttribute("id", property);
    td1.innerHTML = `${property} (${courseobj.grading_ratios[property]}%)`;
    row1.appendChild(td1);

    let td2 = document.createElement("td");
    td2.setAttribute("id", `${property}_i`);
    let input = document.createElement("input");
    input.setAttribute("type", "number");
    input.setAttribute("id", `${property}_i`);
    input.addEventListener("change", () => {
      result += (input.value * courseobj.grading_ratios[property]) / 100;
      document.getElementById("totalgrade").innerHTML = `Your grade is: ${result}`
    });
    td2.appendChild(input);
    row2.appendChild(td2);
  }
});


document.getElementById("s2").appendChild(table);