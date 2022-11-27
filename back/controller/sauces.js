const Sauce = require("../models/Sauce");
const fs = require("fs");

// Display All the Sauces
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }));
};

// Create a Sauce
exports.createSauce = (req, res, next) => {
  const saucePost = JSON.parse(req.body.sauce);
  delete req.body._id;
  delete saucePost._userId;
  const sauce = new Sauce({
    ...saucePost,
    userId: req.auth.userId,
    name: saucePost.name,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked : []
  });
  sauce.save()
    .then(() => {res.status(201).json({ message: "La sauce est bien enregistré" })})
    .catch(error => {res.status(400).json({ error })});
};

//Modify the Sauce
exports.modifySauce = (req, res, next) => {
  const saucePost = req.file ? {
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : {...req.body};
  
  delete saucePost._userId;
  Sauce.findOne({_id: req.params.id})
    .then((sauce) => {
      if(sauce.userId != req.auth.userId) {
        res.status(401).json({message: 'Non-autorisé !'})
      } else {
        Sauce.updateOne({_id: req.params.id}, {...saucePost, _id: req.params.id})
        .then(() => res.status(200).json({message: 'bien modifié'}))
        .catch(error => res.status(401).json({error}))
      }
    })
};

// Delete the Sauce
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      if (sauce.userId != req.auth.userId) {
        res.stauts(401).json({ message: "Non-autorisé" });
      } else {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => {res.status(200).json({ message: "La sauce est bien supprimé" });})
            .catch(error => res.status(401).json({ error }));
        });
      }
    })
    .catch(error => {
      res.status(500).json({ error });
    });
};

// Display the Sauce Clicked
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }));
};

// Count Likes and Dislikes
exports.likeSauces = (req, res, next) => {
  if(req.body.like === 1) {
    Sauce.updateOne({_id: req.params.id}, {$inc: {likes: req.body.like++}, $push: {usersLiked: req.body.userId}})
    .then((sauce) => res.status(200).json({message: 'Vous aimez cette sauce !'}))
    .catch(error => res.status(400).json({error}));
  } else if (req.body.like === -1) {
    Sauce.updateOne({_id: req.params.id}, {$inc: {dislikes: (req.body.like++) * -1}, $push: {usersDisliked: req.body.userId}})
    .then((sauce) => res.status(200).json({message: 'Vous n\'aimez pas cette sauce'}))
    .catch(error => res.status(400).json({error}))
  } else {
    Sauce.findOne({_id: req.params.id})
    .then(sauce => {
      if(sauce.usersLiked.includes(req.body.userId)) {
        Sauce.updateOne({_id: req.params.id}, {$pull: {usersLiked: req.body.userId}, $inc: {likes: req.body.like - 1}})
        .then((sauce) => {res.status(200).json({message: 'Vous n\'aimez pas cette sauce'})})
        .catch(error => res.status(400).json({error}))
      } else if (sauce.usersDisliked.includes(req.body.userId)) {
        Sauce.updateOne({_id: req.params.id}, {$pull: {usersDisliked: req.body.userId}, $inc: {dislikes: -1}})
        .then((sauce) => {res.status(200).json({message : 'Vous aimez cette sauce !'})})
        .catch(error => res.status(400).json({error}))
      }
    } )
    .catch(error => res.status(400).json({error}))
  }
};

