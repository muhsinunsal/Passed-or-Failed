import puppeteer from "puppeteer";
import fs from "fs";

console.time("dbsave");

var start = process.hrtime();

var elapsed_time = function (note) {
    var precision = 3;
    var elapsed = process.hrtime(start)[1] / 1000000;
    console.log(process.hrtime(start)[0] + " s, " + elapsed.toFixed(precision) + " ms - " + note);
    start = process.hrtime();
}

let courses = [];


const run = async () => {
    elapsed_time("Start\n")
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://www.atilim.edu.tr/tr/ects/site-courses/programlar/lisans");

    //Find all programs
    const programIDs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("#mm-0 > div > section:nth-child(3) > div > div > div.col-md-9 > div > ul>li>a"), (e) => e.href.match(/\d+/)[0]);
    });

    //Visit each programs course list and find all course link
    let idCounter = 1;
    for (const id of programIDs) {
        const p = await browser.newPage();
        await p.goto(`https://www.atilim.edu.tr/en/ects/site-courses/${id}/info/Courses`);
        const programName = await p.evaluate(() => document.querySelector(".header-title .container > div >h1").innerText.replace("ECTS - - ", ""));
        console.log(`(${idCounter++}/${programIDs.length}) ${programName} ✔`);
        let newCourses = await p.evaluate(() =>
            Array.from(document.querySelectorAll(".panel.panel-default"), (course) => (
                {
                    link: course.querySelector("a").href,
                    shortName: course.querySelector("strong").innerHTML,
                    fullName: course.querySelector("small.colorRed").innerHTML
                }
            ))
        );
        courses = courses.concat(newCourses)
    }

    //Filter 
    const finalCourseList = [];
    for (const course in courses) {
        let duplicate = finalCourseList.some(c => courses[course].shortName === c.shortName);
        let electiveCourse = courses[course].fullName.includes("Elective");
        let hasShortName = courses[course].shortName != "";

        if (!duplicate && !electiveCourse && hasShortName) {
            finalCourseList.push(courses[course]);
        }
    }

    //Sort
    finalCourseList.sort((a, b) => (a.shortName < b.shortName) ? -1 : ((a.shortName > b.shortName) ? 1 : 0));
    console.log("--------------------------------------------------")

    fs.writeFileSync("data.json", "[");

    //Mark the Date
    const lastUpadted = new Date();
    fs.appendFileSync("data.json", JSON.stringify(lastUpadted.toDateString() ) + ",");

    //Visit each Course Page And Print Gradings
    for (const course in finalCourseList) {
        const coursePage = await browser.newPage();
        await coursePage.goto(finalCourseList[course].link);
        let gradings = await coursePage.evaluate(() =>
            Array.from(document.querySelectorAll(".detail-container.ects div:nth-child(5) > table > tbody > tr"), (grading) => {
                const row = grading.querySelectorAll("td");
                const type = row[0].innerText;
                const number = (row[1].innerText == "-") ? null : Number(row[1].innerText);
                const percentage = (row[2].innerText == "-") ? null : Number(row[2].innerText);
                if (number != null || percentage != null) {
                    return {
                        type: type,
                        number: number,
                        percentage: percentage
                    }
                }
            })
        );

        //Discard gradings which is null
        gradings = gradings.filter(e => e != null);

        //Update the array with gradings
        finalCourseList[course].gradings = gradings;
        console.log(`(${course}/${finalCourseList.length}) ${finalCourseList[course].shortName} ✔`);
        fs.appendFile("data.json", JSON.stringify(finalCourseList[course]) + ",", (err) => {
            if (err) throw course
        })
        coursePage.close();
    }

    fs.appendFile("data.json", "]", (err) => {
        if (err) throw course
    });

    await browser.close();
    elapsed_time("Finish");
}

run();