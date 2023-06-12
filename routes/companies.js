/** Companies routes for BizTime app */


const express = require('express');
const router = new express.Router();
const ExpressError = require('../expressError');
const db = require('../db');


/** for GET /companies => get all companies
 * returns {companies: [{code, name}, ...]} 
 */
router.get("", async function(req, res, next) {
    try {
        const result = await db.query(
            `SELECT code, name
            FROM companies
            ORDER BY name`
        );
        
        return res.json({"companies": result.rows});
    } 
    catch (err) {
        return next(err);
    }
});

/** for GET /companies/[code] => get company details
 * returns {company: {code, name, descrip, invoices: [id,...]}}
 */
router.get("/:code", async function(req, res, next) {
    try {
        let code = req.params.code;

        const compResult = await db.query(
            `SELECT code, name, description
            FROM companies
            WHERE code = $1`, [code]
        );

        const invResult = await db.query(
            `SELECT id 
            FROM invoices
            WHERE comp_code = $1`, [code]
        );

        if (compResult.rows.length === 0) {
            throw new ExpressError(`Company "${code}" not found`, 404);
        }

        const company = compResult.rows[0];
        const invoices = invResult.rows;

        company.invoices = invoices.map(inv => inv.id)

        return res.json({"company": company})
    } 
    catch (err) {
        return next(err);
    }
})

/** for POST /companies => add a company 
 * {code, name, description} => {company: {code, name, description}}
 */
router.post("", async function(req, res, next) {
    try {
        let {code, name, description} = req.body;

        const result = await db.query(
            `INSERT INTO companies (code, name, description)
            VALUES ($1, $2, $3)
            RETURNING code, name, description`, [code, name, description]
        );

        return res.status(201).json({"company": result.rows[0]});
    }
    catch (err) {
        return next(err);
    }
})

/** for PUT /companies/[code] => update a company 
 * {name, description} => {company: {code, name, description}} 
 */
router.put("/:code", async function(req, res, next) {
    try {
        let code = req.params.code;
        let {name, description} = req.body;

        const result = await db.query(
            `UPDATE companies
            SET name = $1, description = $2
            WHERE code = $3
            RETURNING code, name, description`, [name, description, code]
        )

        if (result.rows.length === 0) {
            throw new ExpressError(`Company "${code}" not found`, 404)
        } else {
            return res.json({"company": result.rows[0]});
        }
    }
    catch (err) {
        return next(err);
    }
})

/** for DELETE /companies/[code] => deletes a company
 * returns {status: "deleted"}
 */
router.delete("/:code", async function(req, res, next) {
    try {
        let code = req.params.code;

        const result = await db.query(
            `DELETE FROM companies
            WHERE code = $1
            RETURNING code`, [code]
        )

        if (result.rows.length === 0) {
            throw new ExpressError(`Company "${code}" not found`, 404)
        } else {
            return res.json({"status": "deleted"});
        }
    }
    catch (err) {
        return next(err);
    }
})


module.exports = router;
