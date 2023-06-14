/** Tests for companies */
process.env.NODE_ENV = "test" //set test environment

const request = require('supertest')

const app = require('../app');
const { createData } = require('../_testCreateData');
const db = require('../db');

beforeEach(createData);

afterAll(async () => {
    await db.end();
})

describe("GET /", function() {
    test("It should respond with an array of companies", async function() {
        const response = await request(app).get("/companies");
        expect(response.body).toEqual({
            "companies": [
                {code: "apple", name: "Apple"},
                {code: "ibm", name: "IBM"}
            ]
        })
    })
})

describe("GET /[code]", function() {
    test("It should respond with company information", async function() {
        const response = await request(app).get("/companies/apple");
        expect(response.body).toEqual({
            "company": {
                code: "apple",
                name: "Apple",
                description: "Maker of OSX.",
                "invoices": [1, 2]
            }
        });
    })
    test("Should return status code 404 if not found", async function(){
        const response = await request(app).get("/companies/asdfghjkl");
        expect(response.status).toEqual(404);
    })
});

describe("POST /", function() {
    test("It should add a company", async function() {
        const response = await request(app)
            .post("/companies")
            .send({name: "Shazam", description: "Description"});
        expect(response.body).toEqual({
            "company": {
                 code: "shazam",
                 name: "Shazam",
                 description: "Description"
            }
        })
        
    })
    test("It should return 500 for conflict", async function() {
        const response = await request(app)
            .post("/companies")
            .send({name: "Apple", description: "nan"});
        expect(response.status).toEqual(500);
    })
})

describe("PUT /[code]", function() {
    test("It should update a company", async function() {
        const response = await request(app)
            .put("/companies/apple")
            .send({name: "New Apple", description: "New Description"});
        expect(response.body).toEqual({
            "company": {
                code: "apple",
                name: "New Apple",
                description: "New Description"
            }
        });
    })
    test("Should return status code 404 if not found", async function(){
        const response = await request(app)
        .put("/companies/asdfghjkl")
        .send({name: "New Apple", description: "New Description"});
        expect(response.status).toEqual(404);
    })
    test("Should return status code 500 if missing data", async function() {
        const response = await request(app)
            .put("/companies/apple")
            .send({});
        expect(response.status).toEqual(500);
    })
})

describe("DELETE /[code]", function() {
    test("It should delete a company", async function() {
        const response = await request(app).delete("/companies/apple");
        expect(response.body).toEqual({"status": "deleted"});
    })
    test("Should return status code 404 if not found", async function(){
        const response = await request(app).get("/companies/asdfghjkl");
        expect(response.status).toEqual(404);
    })
})