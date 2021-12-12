const MATH151 = {
  proporites: {
    Name: "MATH 151",
    Namefull: "Calculus I",
    Quiz: 7,
    Midterm: 2,
    Kalmasiniri: "Unknown",
  },
  grading_ratios: {
    MidtermI: 30,
    MidtermII: 30,
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
    MidtermI: 25,
    MidtermII: 25,
    Final: 35,
    Laboratory: 15,
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
    MidtermI: 20,
    MidtermII: 20,
    Final: 25,
    Laboratory: 20,
    Assignment: 15,
  },
};

const courses = [MATH151, CHE105, PHYS101];

function whatCourse(string){
    let course
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
      default:
          console.error("Whatcourse functionuna yanlış string girildi!");
        break;
    }
    return course
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
const row1 = document.createElement("td");
const row2 = document.createElement("td");
table.appendChild(row1);
table.appendChild(row2);

course_i.addEventListener("change", ()=>{
    const courseobj = whatCourse(course_i.value);
    console.log(courseobj)
});

document.getElementById("s2").appendChild(table);


