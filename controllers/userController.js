// const { ObjectId } = require('mongoose').Types;
const { User, Thought } = require("../models");

module.exports = {
  // Get all users
  async getUsers(req, res) {
    try {
      const users = await User.find()
      .populate("thoughts")
      .populate("friends");

      res.json(users);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  },
  // Get a single user
  async getSingleUser(req, res) {
    try {
      const user = await User.findOne({ _id: req.params.userId })
        .select("-__v")
        .populate("thoughts")
        .populate("friends");

      if (!user) {
        return res.status(404).json({ message: "No user with that ID" });
      }

      res.json(user);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  },
  // create a new user
  async createUser(req, res) {
    try {
      const user = await User.create(req.body);
      res.json(user);
    } catch (err) {
      res.status(500).json(err);
    }
  },
  // Delete a user and remove thoughts
  async deleteUser(req, res) {
    try {
      const deletedUser = await User.findOneAndRemove({
        _id: req.params.userId,
      });

      if (!deletedUser) {
        return res.status(404).json({ message: "No such user exists" });
      }

      // Remove thoughts associated with the deleted user
      const deletedThoughts = await Thought.deleteMany({
        _id: { $in: deletedUser.thoughts },
      });

      // Remove user from other users' friend lists
      await User.updateMany(
        { friends: req.params.userId },
        { $pull: { friends: req.params.userId } }
      );

      res.json({
        message:
          "User successfully deleted with their thoughts and removed from friends lists",
        deletedUser,
        deletedThoughts,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  },

  // Update a user
  async updateUser(req, res) {
    try {
      const user = await User.findOneAndUpdate(
        { _id: req.params.userId },
        req.body,
        { new: true, runValidators: true }
      );

      console.log("Update User", user);

      if (!user) {
        return res.status(404).json({ message: "No such user exists" });
      }

      res.json({ message: "User successfully updated" });
    } catch (err) {
      console.log(err);

      // validation errors
      if (err.name === "ValidationError") {
        return res
          .status(400)
          .json({ message: "Validation error", errors: err.errors });
      }

      res.status(500).json(err);
    }
  },

  // Add a friend to a user
  async addFriend(req, res) {
    console.log("You are adding a friend");
    console.log("Request Body:", req.body);

    try {
      const { friend } = req.body;
      const user = await User.findOneAndUpdate(
        { _id: req.params.userId },
        { $addToSet: { friends: friend } },
        { runValidators: true, new: true }
      )
      .populate('friends');

      if (!user) {
        return res
          .status(404)
          .json({ message: "No user found with that ID :(" });
      }

      res.json(user);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  // Remove friend from a user
  async removeFriend(req, res) {
    console.log("DELETE", req.params);
    try {
      const user = await User.findOneAndUpdate(
        { _id: req.params.userId },
        { $pull: { friends: req.params.friendId } },
        { runValidators: true, new: true }
      );
      console.log(user);
      if (!user) {
        return res
          .status(404)
          .json({ message: "No user found with that ID :(" });
      }

      res.json(user);
    } catch (err) {
      res.status(500).json(err);
    }
  },
};
