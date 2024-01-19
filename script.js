"use strict";
const course_inp = document.getElementById("course");
const coursesDataList = document.getElementById("courses");
const searchResetBtn = document.getElementById("searchResetBtn");
const s2 = document.getElementById("s2");
const s3 = document.getElementById("s3");
const s3FinalGrade = document.getElementById("courseTotalGrade");
const s4 = document.getElementById("s4");
const lastUpdateElement = document.getElementById("lastUpdate");
const gradingElementStackTemplate = document.getElementById("gradingStackTemplate");
const courseAddBtn = document.getElementById("addCourseBtn");
const savedCourses = [];
class s2Text {
    constructor(content) {
        this.content = content;
        this.DOMElement = null;
    }
    getDOMElement() {
        if (this.DOMElement) {
            return this.DOMElement;
        }
        const elementWrapper = document.createElement("div");
        elementWrapper.className = "s2Text";
        const element = document.createElement("h2");
        element.innerHTML = this.content;
        elementWrapper.appendChild(element);
        this.DOMElement = elementWrapper;
        console.log(`Created new s2Text with content: '${this.content}'`, this.DOMElement);
        return elementWrapper;
    }
}
const s2Texts = {
    starting: new s2Text("Please start with choosing course you're taking"),
    courseNotFound: new s2Text("There is no data associated with this course."),
    noGradingData: new s2Text("This course doesn't have grading data!"),
};
// Starting status
s2.appendChild(s2Texts.starting.getDOMElement());
const courseSortOrder = {
    "Attendance/Participation": 13,
    "Field Work": 11,
    "Special Course Internship": 12,
    "Quizzes/Studio Critics": 4,
    "Homework Assignments": 3,
    "Midterms Exams/Midterms Jury": 1,
    "Final Exam/Final Jury": 7,
    Presentation: 6,
    Project: 5,
    Report: 8,
    Seminar: 9,
    Laboratory: 2,
    Application: 10,
};
class Grading {
    constructor(gradingData) {
        this.type = gradingData.type;
        this.number = gradingData.number;
        this.percentage = gradingData.percentage;
        this.storedValues = {
            total: 0,
            total_percantage: 0,
        };
        this.calculationStyle = "Percantage";
        this.DOMElements = {
            percantage: null,
            total: null,
            total_percantage: null,
        };
        this.DOMElement = this.genDOMElements();
    }
    genTotalValueInput() {
        const gradingPrime_input_wrapper = document.createElement("div");
        const gradingPrime_input = document.createElement("input");
        gradingPrime_input.className = "gradingInput total";
        gradingPrime_input.type = "number";
        gradingPrime_input.id = `${this.formatedType("forID")}_total`;
        gradingPrime_input.disabled = true;
        gradingPrime_input.addEventListener("change", () => this.calculateGrade("total"));
        gradingPrime_input_wrapper.appendChild(gradingPrime_input);
        gradingPrime_input.value = "";
        this.DOMElements.total = gradingPrime_input;
        return gradingPrime_input_wrapper;
    }
    totalPercantageValueInput() {
        const totalPercantageValue_input_wrapper = document.createElement("div");
        const totalPercantageValue_input = document.createElement("input");
        totalPercantageValue_input.className = "gradingInput total_percantage";
        totalPercantageValue_input.type = "number";
        totalPercantageValue_input.id = `${this.formatedType("forID")}_total_percantage`;
        totalPercantageValue_input.disabled = true;
        totalPercantageValue_input.addEventListener("change", () => this.calculateGrade("total_percantage"));
        totalPercantageValue_input_wrapper.appendChild(totalPercantageValue_input);
        totalPercantageValue_input.value = "";
        this.DOMElements.total_percantage = totalPercantageValue_input;
        return totalPercantageValue_input_wrapper;
    }
    genInputArr() {
        let tempArr = [];
        let tempArr2 = [];
        for (let i = 0; i < this.number; i++) {
            const list_element = document.createElement("li");
            const grading_input = document.createElement("input");
            grading_input.className = "gradingInput percantage";
            grading_input.type = "number";
            grading_input.id = `${this.formatedType("forID")}_${i}`;
            grading_input.addEventListener("change", () => this.calculateGrade("percantage"));
            // grading_input.disabled = true
            list_element.appendChild(grading_input);
            tempArr.push(list_element);
            tempArr2.push(grading_input);
        }
        this.DOMElements.percantage = tempArr2;
        return tempArr;
    }
    genDOMElements() {
        const gradingStack = document.createElement("ol");
        gradingStack.className = "gradingStack";
        gradingStack.id = `gradingStack_${this.formatedType("forID")}`;
        const gradingTitle = document.createElement("span");
        gradingTitle.innerText = this.formatedType("forDisplay");
        gradingTitle.className = "text";
        const percantageText = document.createElement("span");
        percantageText.className = "percantageText";
        if (this.isPerInput() && this.number !== 1) {
            percantageText.innerText = ` (${this.percentage / this.number}% per)`;
        }
        else {
            percantageText.innerText = ` (${this.percentage}%)`;
        }
        gradingTitle.appendChild(percantageText);
        const gradingSubTitle = document.createElement("span");
        gradingSubTitle.className = `subtext ${this.calculationStyle.toLocaleLowerCase()}`;
        gradingSubTitle.innerText = this.calculationStyle;
        gradingSubTitle.addEventListener("click", (event) => {
            this.switchCalculationStyle(gradingStack);
        });
        const inputArray = this.genInputArr();
        const totalInput = this.genTotalValueInput();
        const totalPercInput = this.totalPercantageValueInput();
        gradingStack.appendChild(gradingTitle);
        gradingStack.appendChild(gradingSubTitle);
        gradingStack.appendChild(totalInput);
        gradingStack.appendChild(totalPercInput);
        inputArray.forEach((input) => gradingStack.appendChild(input));
        return gradingStack;
    }
    switchCalculationStyle(stack) {
        const title = stack.childNodes[0];
        const subtitle = stack.childNodes[1];
        subtitle.className = `subtext ${this.calculationStyle.toLocaleLowerCase()}`;
        const totalInput = stack.childNodes[2].childNodes[0];
        const totalPercInput = stack.childNodes[3].childNodes[0];
        const percantageInput = Array.from(stack.childNodes)
            .slice(4)
            .map((inpElement) => inpElement.childNodes)
            .map((node) => node[0]);
        // First disable everyone
        totalInput.disabled = true;
        totalPercInput.disabled = true;
        percantageInput.forEach((inp) => (inp.disabled = true));
        /* Disabled totalPercInput */
        // switch (this.calculationStyle) {
        // 	case "Percantage":
        // 		totalInput.disabled = false;
        // 		totalInput.focus();
        // 		this.calculationStyle = "Total";
        // 		break;
        // 	case "Total":
        // 		totalPercInput.disabled = false;
        // 		totalPercInput.focus();
        // 		this.calculationStyle = "Total_Percantage";
        // 		break;
        // 	case "Total_Percantage":
        // 		percantageInput.forEach((inp) => (inp.disabled = false));
        // 		percantageInput[0].focus();
        // 		this.calculationStyle = "Percantage";
        // 		break;
        // }
        switch (this.calculationStyle) {
            case "Percantage":
                totalInput.disabled = false;
                totalInput.focus();
                this.calculationStyle = "Total";
                break;
            case "Total":
                percantageInput.forEach((inp) => (inp.disabled = false));
                percantageInput[0].focus();
                this.calculationStyle = "Percantage";
                break;
        }
        subtitle.innerHTML = this.calculationStyle;
        return this.calculationStyle;
    }
    formatedType(option) {
        if (option === "forDisplay") {
            return this.type.trim().split("/").shift();
        }
        else if (option === "forID") {
            return this.type
                .trim()
                .split("/")
                .shift()
                .split(" ")
                .map((str) => str.toLowerCase())
                .join("_");
        }
        else {
            return undefined;
        }
    }
    log() {
        console.log(this);
        console.log(courseSortOrder[this.type]);
    }
    isPerInput() {
        let table = {
            "Attendance/Participation": false,
            "Field Work": true,
            "Special Course Internship": true,
            "Quizzes/Studio Critics": false,
            "Homework Assignments": false,
            "Midterms Exams/Midterms Jury": true,
            "Final Exam/Final Jury": true,
            Presentation: true,
            Project: false,
            Report: false,
            Seminar: false,
            Laboratory: false,
            Application: true,
        };
        return table[this.type];
    }
    calculateGrade(triggerOwner) {
        var _a, _b;
        // console.log("Pre Calc", this.storedValues);
        switch (triggerOwner) {
            case "percantage":
                // Restart storedValues
                this.storedValues = {
                    total: 0,
                    total_percantage: 0,
                };
                // Calc total_percantage
                (_a = this.DOMElements.percantage) === null || _a === void 0 ? void 0 : _a.forEach((element) => {
                    if (element.value.trim() === "-") {
                        this.storedValues.total_percantage += 0;
                    }
                    else {
                        this.storedValues.total_percantage += Number(element.value);
                    }
                });
                // Calc total
                this.storedValues.total = (this.storedValues.total_percantage * this.percentage) / 100 / this.number;
                // Update input Elements
                this.DOMElements.total_percantage.value = String(this.storedValues.total_percantage);
                this.DOMElements.total.value = String(this.storedValues.total);
                break;
            case "total":
                // Update storedValues
                this.storedValues.total = +this.DOMElements.total.value;
                // Forget percantage input Elements
                this.DOMElements.percantage.forEach((element) => (element.value = ""));
                // Update total_percantage
                this.DOMElements.total_percantage.value = "" + (this.storedValues.total * 100) / this.percentage;
                break;
            case "total_percantage":
                // Update storedValues
                this.storedValues.total_percantage = +this.DOMElements.total_percantage.value;
                // Forget percantage input Elements
                (_b = this.DOMElements.percantage) === null || _b === void 0 ? void 0 : _b.forEach((element) => (element.value = ""));
                // Update total
                this.DOMElements.total.value = "" + (this.storedValues.total_percantage / 100) * this.percentage;
                break;
        }
        return this.storedValues.total;
    }
}
class Course {
    constructor(courseData) {
        this.link = courseData.link;
        this.shortName = courseData.shortName;
        this.fullName = courseData.fullName;
        this.gradings = courseData.gradings.map((raw_grading) => new Grading(raw_grading));
        this.DOMElements = null;
        this.totalEarnedGrade = 0;
    }
    sortGradings() {
        this.gradings = this.gradings.sort((a, b) => {
            if (courseSortOrder[a.type] > courseSortOrder[b.type]) {
                return 1;
            }
            else if (courseSortOrder[a.type] < courseSortOrder[b.type]) {
                return -1;
            }
            else {
                return 0;
            }
        });
        return this.gradings;
    }
    log() {
        this.sortGradings();
        console.log(this);
    }
    renderDOMELements(target) {
        if (this.DOMElements && this.DOMElements.length) {
            this.DOMElements.forEach((element) => target.appendChild(element));
        }
        else {
            // Check if Course has grading data
            if (this.gradings.length === 0) {
                const errorText = s2Texts["noGradingData"];
                s2.appendChild(errorText.getDOMElement());
            }
            else {
                this.sortGradings();
                let arr = [];
                const parent = document.createElement("div");
                this.DOMElements = this.gradings.map((grading) => grading.DOMElement);
                this.DOMElements.forEach((element) => target.appendChild(element));
                console.log(`Created new Course named ${this.shortName}`, this);
                // Attach event listener to every Grading
                this.gradings.forEach((grading) => {
                    var _a, _b, _c;
                    (_a = grading.DOMElements.percantage) === null || _a === void 0 ? void 0 : _a.forEach((input) => {
                        input.addEventListener("change", this.calculateCourseGrade.bind(this));
                    });
                    (_b = grading.DOMElements.total) === null || _b === void 0 ? void 0 : _b.addEventListener("change", this.calculateCourseGrade.bind(this));
                    (_c = grading.DOMElements.total_percantage) === null || _c === void 0 ? void 0 : _c.addEventListener("change", this.calculateCourseGrade);
                });
            }
        }
    }
    calculateCourseGrade() {
        let totalCourseGrade = 0;
        this.gradings.forEach((grading) => (totalCourseGrade += grading.storedValues.total));
        s3FinalGrade.innerHTML = "" + totalCourseGrade;
        if (totalCourseGrade !== 0) {
            courseAddBtn.disabled = false;
        }
        else {
            courseAddBtn.disabled = true;
        }
    }
}
const handleJSON = ([updateDate, ...courses]) => {
    // Last Update Time
    lastUpdateElement.innerText = updateDate;
    const courseArray = courses.map((course) => new Course(course));
    // Init Course Select Input
    fillSelectInput(courseArray);
    searchResetBtn.addEventListener("click", () => {
        s2.innerHTML = "";
        course_inp.value = "";
        s2.appendChild(s2Texts.starting.getDOMElement());
    });
    course_inp.addEventListener("change", (e) => {
        // Hide Header
        s2.innerHTML = "";
        if (course_inp.value.trim() === "") {
            //If input is empty
            s2.appendChild(s2Texts.starting.getDOMElement());
        }
        else {
            const selectedCourse = courseArray.find((course) => course.shortName === course_inp.value);
            if (!selectedCourse) {
                // If selected course not found
                s2.appendChild(s2Texts.courseNotFound.getDOMElement());
            }
            else {
                //If everythings okay
                selectedCourse === null || selectedCourse === void 0 ? void 0 : selectedCourse.renderDOMELements(s2);
                courseAddBtn.addEventListener("click", () => {
                    s4.classList.remove("hidden");
                    savedCourses.push(selectedCourse);
                });
            }
        }
    });
};
const fillSelectInput = (courseArray) => {
    courseArray.forEach((course) => {
        const option = document.createElement("option");
        option.value = course.shortName;
        option.innerText = course.fullName;
        coursesDataList === null || coursesDataList === void 0 ? void 0 : coursesDataList.appendChild(option);
    });
};
fetch("./data.json")
    .then((res) => res.json())
    .then(handleJSON);
//# sourceMappingURL=script.js.map