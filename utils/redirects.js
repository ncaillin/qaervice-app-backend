const redirectOwner = (req, res, next) => {
  if (!req.session.uid) 
  {
    return res.redirect('/login')
  }
  if (!(req.session.type === 'Owner'))
  {
    return res.redirect('/employee/home')
  }
  next()
}

module.exports = { redirectOwner }
