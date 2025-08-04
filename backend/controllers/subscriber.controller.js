import Subscriber from "../models/subscriber.model.js";

export const addSubscriber = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        const existingSubscriber = await Subscriber.findOne({ email });
        if (existingSubscriber) {
            return res.status(400).json({ success: false, message: "Email already subscribed" });
        }

        await Subscriber.create({ email });

        res.json({ success: true, message: "Subscribed successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};