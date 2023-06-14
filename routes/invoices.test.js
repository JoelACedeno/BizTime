/** Tests for invoices */
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
    test("It should respond with an array of invoices", async function() {
        const response = await request(app).get("/invoices");
        expect(response.body).toEqual({
            "invoices": [
                {id: 1, comp_code: "apple"},
                {id: 2, comp_code: "apple"},
                {id: 3, comp_code: "ibm"},
            ]
        })
    })
})

describe("GET /1", function() {
    test("It should respond with invoice information", async function() {
        const response = await request(app).get("/invoices/1");
        expect(response.body).toEqual({
            "invoice": {
                "id": 1,
                "company": {
                    "code": "apple",
                    "name": "Apple",
                    "description": "Maker of OSX."
                },
                "amt": 100,
                "paid": false,
                "add_date": "2018-01-01T05:00:00.000Z",
                "paid_date": null
            }
        });
    })
    test("Should return status code 404 if not found", async function(){
        const response = await request(app).get("/invoices/9999");
        expect(response.status).toEqual(404);
    })
});

describe("POST /", function() {
    test("It should add an invoice", async function() {
        const response = await request(app)
            .post("/invoices")
            .send({amt: "400", comp_code: "ibm"});
        expect(response.body).toEqual({
            "invoice": {
                "id": 4,
                "comp_code": "ibm",
                "amt": 400,
                "paid": false,
                "add_date": "2023-06-13T04:00:00.000Z",
                "paid_date": null
            }
        });
        
    })
});

describe("PUT /[code]", function() {
    test("It should update an invoice", async function() {
        const response = await request(app)
            .put("/invoices/1")
            .send({amt: "300"});
        expect(response.body).toEqual({
            "invoice": {
                "id": 1,
                "comp_code": "apple",
                "amt": 300,
                "paid": false,
                "add_date": "2018-01-01T05:00:00.000Z",
                "paid_date": null
            }
        });
    })
    test("Should return status code 404 if not found", async function(){
        const response = await request(app)
        .put("/invoices/9999")
        .send({amt: "300"});
        expect(response.status).toEqual(404);
    })
    test("Should return status code 500 if missing data", async function() {
        const response = await request(app)
            .put("/invoices/1")
            .send({});
        expect(response.status).toEqual(500);
    })
})

describe("DELETE /[code]", function() {
    test("It should delete an invoice", async function() {
        const response = await request(app).delete("/invoices/1");
        expect(response.body).toEqual({"status": "deleted"});
    })
    test("Should return status code 404 if not found", async function(){
        const response = await request(app).delete("/invoices/9999");
        expect(response.status).toEqual(404);
    })
})