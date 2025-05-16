import Brand from "../models/Brand.js";

const getAll = async (req, res) => {
  try {
    const brands = await Brand.find({ isDeleted: false });
    res.json(brands);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const create = async (req, res) => {
  try {
    const newBrand = new Brand(req.body);
    const saved = await newBrand.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export { getAll, create };