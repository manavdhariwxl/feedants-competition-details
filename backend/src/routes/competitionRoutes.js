const express = require('express');
const { identifyUser, requireUser } = require('../middleware/identifyUser');
const { validateObjectIdParam } = require('../middleware/validate');
const controller = require('../controllers/competitionController');

const router = express.Router();

router.use(identifyUser);

router.get('/', controller.listCompetitions);
router.get('/:id', validateObjectIdParam('id'), controller.getCompetitionDetails);
router.get('/:id/registration-status', validateObjectIdParam('id'), controller.getMyRegistrationStatus);
router.post('/:id/register', validateObjectIdParam('id'), requireUser, controller.registerForCompetition);

module.exports = router;
