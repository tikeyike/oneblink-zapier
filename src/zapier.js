'use strict'

const Axios = require('axios')
const Boom = require('@hapi/boom')
const OneBlink = require('@oneblink/sdk')

const formsSDK = new OneBlink.Forms({
  accessKey: process.env.FORMS_ACCESS_KEY,
  secretKey: process.env.FORMS_SECRET_KEY,
})

module.exports.post = async function webhook(req) {
  console.log('🔍 Validating webhook request payload')
  if (
    !req.body ||
    !req.body.formId ||
    !req.body.submissionId ||
    !req.body.secret
  ) {
    throw Boom.badRequest('Invalid webhook request payload', req.body)
  }

  console.log('✅ Authorising webhook request')
  if (req.body.secret !== process.env.WEB_HOOK_SECRET) {
    throw Boom.forbidden('Unauthorised', req.body)
  }

  console.log('🎣 Retrieving form data for submission', {
    formId: req.body.formId,
    submissionId: req.body.submissionId,
    isDraft: req.body.isDraft,
  })

  const { submission } = await formsSDK.getSubmissionData(
    req.body.formId,
    req.body.submissionId,
    req.body.isDraft,
  )

  console.log(submission)

  await Axios.post(process.env.WEB_HOOK_ENDPOINT, submission)

  console.log('📤 Posted submission data to: ', process.env.WEB_HOOK_ENDPOINT)

  console.log('🎉 Webhook completed successfully')
}
