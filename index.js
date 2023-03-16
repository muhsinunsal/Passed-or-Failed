import puppeteer, { Browser } from "puppeteer";
import fs from "fs";
import { json } from "stream/consumers";
import { title } from "process";

console.time("dbsave");

var start = process.hrtime();

var elapsed_time = function (note) {
    var precision = 3; // 3 decimal places
    var elapsed = process.hrtime(start)[1] / 1000000; // divide by a million to get nano to milli
    console.log(process.hrtime(start)[0] + " s, " + elapsed.toFixed(precision) + " ms - " + note); // print message + time
    start = process.hrtime(); // reset the timer
}


let courses = [];

const run = async () => {
    elapsed_time("start")
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://www.atilim.edu.tr/tr/ects/site-courses/programlar/lisans");

    //Find all programs

    const programIDs = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("#mm-0 > div > section:nth-child(3) > div > div > div.col-md-9 > div > ul>li>a"), (e) => e.href.match(/\d+/)[0]);
    });

    //Visit each programs course list and find all course link
    for (const id of programIDs) {
        const p = await browser.newPage();
        await p.goto(`https://www.atilim.edu.tr/en/ects/site-courses/${id}/info/Courses`);
        console.log(await p.evaluate(() => document.title));
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

    //Deete duplicates
    const finalCourses = [];
    for (const course in courses) {
        if (finalCourses.some(c => courses[course].shortName === c.shortName)) {

        }else{
            finalCourses.push(courses[course]);
        }
    }

    fs.writeFile("ids.json", JSON.stringify(finalCourses), (err) => {
        if (err) throw err;
    });
    await browser.close();
    elapsed_time("finish")
}
run();
const Onlisans_button = "https://www.atilim.edu.tr/tr/ects/site-courses/programlar/onlisans";
"https://www.atilim.edu.tr/tr/ects/site-courses/programlar/lisans";
const Lisans_button = "https://www.atilim.edu.tr/tr/ects/site-courses/212/info/Courses";

//document.querySelectorAll("#mm-0 > div > section:nth-child(3) > div > div > div.col-md-9 > div > ul>li")