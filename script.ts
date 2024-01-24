const course_inp = document.getElementById("course") as HTMLInputElement;
const coursesDataList = document.getElementById("courses") as HTMLDataListElement;
const searchResetBtn = document.getElementById("searchResetBtn") as HTMLButtonElement;
const s2 = document.getElementById("s2")! as HTMLDivElement;
const s3 = document.getElementById("s3")! as HTMLDivElement;
const s3FinalGrade = document.getElementById("courseTotalGrade") as HTMLSpanElement;
const s4 = document.getElementById("s4") as HTMLDivElement;
const lastUpdateElement = document.getElementById("lastUpdate")! as HTMLSpanElement;
const gradingElementStackTemplate = document.getElementById("gradingStackTemplate") as HTMLTemplateElement;
const courseAddBtn = document.getElementById("addCourseBtn") as HTMLButtonElement;
let courseAddBtnLock = true;
let selectedCourse: Course | undefined = undefined;

class s2Text {
	private DOMElement: HTMLDivElement | null;
	constructor(public content: string) {
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
	duplicateRecord: new s2Text("There are already data on this course"),
	noRecord: new s2Text("There is no record to show"),
};
// Starting status
s2.appendChild(s2Texts.starting.getDOMElement());

type CourseData = {
	link: string;
	shortName: string;
	fullName: string;
	gradings: GradingData[];
};

type GradingData = {
	type: GradingType | GradingStrings;
	number: number;
	percentage: number;
};

type GradingStrings =
	| "Attendance/Participation"
	| "Field Work"
	| "Special Course Internship"
	| "Quizzes/Studio Critics"
	| "Homework Assignments"
	| "Midterms Exams/Midterms Jury"
	| "Final Exam/Final Jury"
	| "Presentation"
	| "Project"
	| "Report"
	| "Seminar"
	| "Laboratory"
	| "Application";

class GradingType {
	private courseSortOrder = {
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
	private perInputTable = {
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
	constructor(private typeName: GradingStrings) {}
	get sortingOrder() {
		return this.courseSortOrder[this.typeName];
	}
	get isPerInput() {
		return this.perInputTable[this.typeName];
	}
	getNameString(option?: "forID" | "forDisplay") {
		if (option === "forDisplay") {
			return this.typeName.trim().split("/").shift()!;
		} else if (option === "forID") {
			return this.typeName
				.trim()
				.split("/")
				.shift()!
				.split(" ")
				.map((str) => str.toLowerCase())
				.join("_")!;
		}
		return this.typeName as GradingStrings;
	}
}

class Grading implements GradingData {
	type: GradingType;
	number: number;
	percentage: number;
	calculationStyle: "Percantage" | "Total" | "Total_Percantage";
	DOMElement: HTMLOListElement;
	storedValues: {
		total: number;
		total_percantage: number;
	};
	DOMElements: {
		percantage: HTMLInputElement[] | null;
		total: HTMLInputElement | null;
		total_percantage: HTMLInputElement | null;
	};
	constructor(gradingData: GradingData) {
		this.type = new GradingType(gradingData.type as GradingStrings);
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
	private genTotalValueInput() {
		const gradingPrime_input_wrapper = document.createElement("div");
		const gradingPrime_input = document.createElement("input");
		gradingPrime_input.className = "gradingInput total";
		gradingPrime_input.type = "number";
		gradingPrime_input.id = `${this.type.getNameString("forID")}_total`;
		gradingPrime_input.disabled = true;
		gradingPrime_input.addEventListener("change", () => this.calculateGrade("total"));
		gradingPrime_input_wrapper.appendChild(gradingPrime_input);
		gradingPrime_input.value = "";

		this.DOMElements.total = gradingPrime_input;

		return gradingPrime_input_wrapper;
	}

	private totalPercantageValueInput() {
		const totalPercantageValue_input_wrapper = document.createElement("div");
		const totalPercantageValue_input = document.createElement("input");
		totalPercantageValue_input.className = "gradingInput total_percantage";
		totalPercantageValue_input.type = "number";
		totalPercantageValue_input.id = `${this.type.getNameString("forID")}_total_percantage`;
		totalPercantageValue_input.disabled = true;
		totalPercantageValue_input.addEventListener("change", () => this.calculateGrade("total_percantage"));

		totalPercantageValue_input_wrapper.appendChild(totalPercantageValue_input);
		totalPercantageValue_input.value = "";

		this.DOMElements.total_percantage = totalPercantageValue_input;

		return totalPercantageValue_input_wrapper;
	}
	private genInputArr() {
		let tempArr: HTMLLIElement[] = [];
		let tempArr2: HTMLInputElement[] = [];
		for (let i = 0; i < this.number; i++) {
			const list_element = document.createElement("li");
			const grading_input = document.createElement("input");
			grading_input.className = "gradingInput percantage";
			grading_input.type = "number";
			grading_input.id = `${this.type.getNameString("forID")}_${i}`;
			grading_input.addEventListener("change", () => this.calculateGrade("percantage"));

			// grading_input.disabled = true
			list_element.appendChild(grading_input);
			tempArr.push(list_element);
			tempArr2.push(grading_input);
		}
		this.DOMElements.percantage = tempArr2;
		return tempArr;
	}
	private genDOMElements() {
		const gradingStack = document.createElement("ol");
		gradingStack.className = "gradingStack";
		gradingStack.id = `gradingStack_${this.type.getNameString("forID")}`;
		const gradingTitle = document.createElement("span");
		gradingTitle.innerText = this.type.getNameString("forDisplay")!;
		gradingTitle.className = "text";
		const percantageText = document.createElement("span");
		percantageText.className = "percantageText";
		if (this.type.isPerInput && this.number !== 1) {
			percantageText.innerText = ` (${this.percentage / this.number}% per)`;
		} else {
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
	private switchCalculationStyle(stack: HTMLOListElement) {
		const title = stack.childNodes[0] as HTMLSpanElement;
		const subtitle = stack.childNodes[1] as HTMLSpanElement;
		subtitle.className = `subtext ${this.calculationStyle.toLocaleLowerCase()}`;

		const totalInput = stack.childNodes[2].childNodes[0] as HTMLInputElement;
		const totalPercInput = stack.childNodes[3].childNodes[0] as HTMLInputElement;
		const percantageInput = Array.from(stack.childNodes)
			.slice(4)
			.map((inpElement) => inpElement.childNodes)
			.map((node) => node[0]) as HTMLInputElement[];

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

	calculateGrade(triggerOwner: "percantage" | "total" | "total_percantage") {
		// console.log("Pre Calc", this.storedValues);
		switch (triggerOwner) {
			case "percantage":
				// Restart storedValues
				this.storedValues = {
					total: 0,
					total_percantage: 0,
				};

				// Calc total_percantage
				this.DOMElements.percantage?.forEach((element) => {
					if (element.value.trim() === "-") {
						this.storedValues.total_percantage += 0;
					} else {
						this.storedValues.total_percantage += Number(element.value);
					}
				});
				// Calc total
				this.storedValues.total = (this.storedValues.total_percantage * this.percentage) / 100 / this.number;

				// Update input Elements
				this.DOMElements.total_percantage!.value = String(this.storedValues.total_percantage);
				this.DOMElements.total!.value = String(this.storedValues.total);
				break;
			case "total":
				// Update storedValues
				this.storedValues.total = +this.DOMElements.total!.value;
				// Forget percantage input Elements
				this.DOMElements.percantage!.forEach((element) => (element.value = ""));
				// Update total_percantage
				this.DOMElements.total_percantage!.value = "" + (this.storedValues.total * 100) / this.percentage;

				break;
			case "total_percantage":
				// Update storedValues
				this.storedValues.total_percantage = +this.DOMElements.total_percantage!.value;
				// Forget percantage input Elements
				this.DOMElements.percantage?.forEach((element) => (element.value = ""));
				// Update total
				this.DOMElements.total!.value = "" + (this.storedValues.total_percantage / 100) * this.percentage;

				break;
		}
		return this.storedValues.total;
	}
}

class Course implements CourseData {
	link: string;
	shortName: string;
	fullName: string;
	gradings: Grading[];
	private DOMElements: HTMLElement[] | null;
	totalEarnedGrade: number;
	constructor(courseData: CourseData) {
		this.link = courseData.link;
		this.shortName = courseData.shortName;
		this.fullName = courseData.fullName;
		this.gradings = courseData.gradings.map((raw_grading) => new Grading(raw_grading));
		this.DOMElements = null;
		this.totalEarnedGrade = 0;
	}
	private sortGradings() {
		this.gradings = this.gradings.sort((a, b) => {
			if (a.type.sortingOrder > b.type.sortingOrder) {
				return 1;
			} else if (a.type.sortingOrder < b.type.sortingOrder) {
				return -1;
			} else {
				return 0;
			}
		});
		return this.gradings;
	}

	renderDOMELements(target: HTMLDivElement) {
		if (this.DOMElements && this.DOMElements.length) {
			this.DOMElements.forEach((element) => target.appendChild(element));
		} else {
			// Check if Course has grading data
			if (this.gradings.length === 0) {
				const errorText = s2Texts["noGradingData"];
				s2.appendChild(errorText.getDOMElement());
			} else {
				this.sortGradings();
				let arr: HTMLElement[] = [];
				const parent = document.createElement("div");
				this.DOMElements = this.gradings.map((grading) => grading.DOMElement);
				this.DOMElements.forEach((element) => target.appendChild(element));
				console.log(`Created new Course named ${this.shortName}`, this);

				// Attach event listener to every Grading
				this.gradings.forEach((grading) => {
					grading.DOMElements.percantage?.forEach((input) => {
						input.addEventListener("change", this.calculateCourseGrade.bind(this));
					});
					grading.DOMElements.total?.addEventListener("change", this.calculateCourseGrade.bind(this));
					grading.DOMElements.total_percantage?.addEventListener("change", this.calculateCourseGrade);
				});
			}
		}
	}
	calculateCourseGrade() {
		let totalCourseGrade = 0;
		this.gradings.forEach((grading) => (totalCourseGrade += grading.storedValues.total));
		s3FinalGrade.innerHTML = "" + totalCourseGrade.toFixed(2);

		if (totalCourseGrade === 0) {
			courseAddBtn.disabled = true;
		} else {
			courseAddBtn.disabled = false;
		}
		return totalCourseGrade;
	}
}

class CourseRecord {
	grades: {
		[key in GradingStrings]?: number;
	};
	totalGrade: number;
	constructor(public course: Course, public date: Date) {
		this.totalGrade = course.calculateCourseGrade();
		this.grades = {};
		course.gradings.forEach((grading) => {
			// TOTAL PERCANTAGE MIGHT BE WRONG CHECK LATER
			this.grades[grading.type.getNameString() as GradingStrings] = +grading.DOMElements.total_percantage!.value;
		});
	}
}

class RecordTable {
	records: CourseRecord[];
	columns: GradingType[];
	DOMElement: HTMLElement | null;
	childElements: {
		header: HTMLElement[];
		courses: {
			courseName?: HTMLElement;
			grades?: HTMLElement[];
			total?: HTMLElement;
		}[];
	};
	constructor() {
		this.records = [];
		this.columns = [];
		this.DOMElement = null;
		this.childElements = {
			header: [],
			courses: [],
		};
	}
	addRecord(record: CourseRecord) {
		this.records.push(record);
		console.log(record);
	}
	removeRecord(courseShortName: string) {
		this.records = this.records.filter((record) => record.course.shortName !== courseShortName);
		this.render();
		courseAddBtn.disabled = false;
	}
	importTable(oldTable: string) {}
	render() {
		// Restart s4
		s4.innerHTML = "";
		if (this.records.length > 0) {
			const table = document.createElement("table");
			table.id = "recordTable";
			s4.appendChild(table);

			// Header Row
			const headerRow = document.createElement("tr");
			const emptyCell = document.createElement("th");
			const totalCell = document.createElement("th");
			emptyCell.innerText = "";
			totalCell.innerText = "Total / 100";

			//Concat two record's grading types
			this.columns = Object.keys(
				this.records
					.map((record) => record.grades)
					.reduce((a, b) => {
						return { ...a, ...b };
					})
			)
				.map((key) => new GradingType(key as GradingStrings))
				.sort((a, b) => {
					if (a.sortingOrder > b.sortingOrder) {
						return 1;
					} else if (a.sortingOrder < b.sortingOrder) {
						return -1;
					} else {
						return 0;
					}
				});
			this.childElements.header.push(emptyCell);
			headerRow.appendChild(emptyCell);
			this.columns.forEach((column) => {
				const td = document.createElement("th");
				td.innerText = column.getNameString("forDisplay");
				if (column.isPerInput) {
					if (column.getNameString() !== "Final Exam/Final Jury") {
						const sumText = document.createElement("h6");
						sumText.innerText = "(Sum of)";
						td.appendChild(sumText);
					}
				}

				this.childElements.header.push(td);
				headerRow.appendChild(td);
			});

			headerRow.appendChild(totalCell);
			table.appendChild(headerRow);

			// Record Rows
			this.records.forEach((record) => {
				const row = document.createElement("tr");
				const courseName = document.createElement("td");
				courseName.innerText = record.course.shortName;
				courseName.className = "rowName";
				const removeBtn = document.createElement("h6");
				removeBtn.innerText = "✘";
				removeBtn.addEventListener("click", () => {
					this.removeRecord(record.course.shortName);
				});
				courseName.appendChild(removeBtn);
				row.appendChild(courseName);
				table.appendChild(row);

				const HTMLElementObj: {
					courseName?: HTMLElement;
					grades?: HTMLElement[];
					total?: HTMLElement;
				} = {
					grades: [],
				};

				HTMLElementObj.courseName = courseName;

				// for (let [key, value] of Object.entries(record.grades)) {
				// 	const gradeElement = document.createElement("td");
				// 	HTMLElementObj.grades!.push(gradeElement);
				// 	row.appendChild(gradeElement);
				// 	if (key in record.grades) {
				// 		if (value === 0) {
				// 			gradeElement.classList.add("empty");
				// 			gradeElement.innerText = "-";
				// 		} else {
				// 			gradeElement.innerText = "" + value;
				// 		}
				// 	}
				// }

				this.columns.forEach((column) => {
					const gradeElement = document.createElement("td");
					row.appendChild(gradeElement);
					HTMLElementObj.grades!.push(gradeElement);
					if (record.grades[column.getNameString() as GradingStrings] !== undefined) {
						// Has this grading type
						if (record.grades[column.getNameString() as GradingStrings] === 0) {
							// Got 0 point
							// gradeElement.classList.add("empty");
							gradeElement.innerText = "?";
						} else {
							// If displayed per input
							if (column.isPerInput) {
								let gradingNumber = record.course.gradings.find(
									(grading) => grading.type.getNameString() === column.getNameString()
								)!.number;
								gradeElement.innerText =
									"" +
									(record.grades[column.getNameString() as GradingStrings]! / gradingNumber).toFixed(
										2
									);
							} else {
								// Everthing normal
								gradeElement.innerText =
									"" + record.grades[column.getNameString() as GradingStrings]?.toFixed(2);
							}
						}
					} else {
						// Has't have this grading type
						// gradeElement.classList.add("disabled");
					}
				});

				this.childElements.courses.push(HTMLElementObj);

				const totalPoint = document.createElement("td");
				totalPoint.innerText = "" + record.totalGrade.toFixed(2);
				row.appendChild(totalPoint);
				HTMLElementObj.total = totalPoint;
			});
		} else {
			s4.insertAdjacentElement("afterbegin", s2Texts.noRecord.getDOMElement());
		}
	}
}

const recordTable = new RecordTable();

const handleJSON = ([updateDate, ...courses]: [string, ...CourseData[]]) => {
	// Last Update Time
	lastUpdateElement.innerText = updateDate;

	const courseArray = courses.map((course) => new Course(course));

	// Init Course Select Input
	fillSelectInput(courseArray);

	searchResetBtn.addEventListener("click", () => {
		s2.innerHTML = "";
		course_inp.value = "";
		s3FinalGrade.innerText = "" + 0;
		s2.appendChild(s2Texts.starting.getDOMElement());
	});

	course_inp!.addEventListener("change", (e) => {
		// Hide Header
		s2.innerHTML = "";
		if (course_inp.value.trim() === "") {
			//If input is empty
			s2.appendChild(s2Texts.starting.getDOMElement());
			courseAddBtn.disabled = true;
		} else {
			selectedCourse = courseArray.find((course) => course.shortName === course_inp.value);
			if (selectedCourse) {
				//If everythings okay
				selectedCourse?.renderDOMELements(s2);
			} else {
				// If selected course not found
				s2.appendChild(s2Texts.courseNotFound.getDOMElement());
			}
		}
	});

	courseAddBtn.addEventListener("click", () => {
		if (selectedCourse) {
			const hasDuplicate =
				recordTable.records.filter((record) => record.course.shortName === selectedCourse!.shortName).length !==
				0;
			//Pervent duplicates
			if (hasDuplicate) {
				const warningText = s2Texts.duplicateRecord.getDOMElement();
				s4.insertAdjacentElement("afterbegin", warningText);
			} else {
				s4.classList.remove("hidden");
				recordTable.addRecord(new CourseRecord(selectedCourse, new Date()));
				recordTable.render();
				courseAddBtn.disabled = true;
			}
		} else {
			s4.insertAdjacentElement("afterbegin", s2Texts.courseNotFound.getDOMElement());
		}
	});
};

const fillSelectInput = (courseArray: Course[]) => {
	courseArray.forEach((course) => {
		const option = document.createElement("option");
		option.value = course.shortName;
		option.innerText = course.fullName;
		coursesDataList?.appendChild(option);
	});
};

fetch("./data.json")
	.then((res) => res.json())
	.then(handleJSON);
