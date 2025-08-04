import fs from 'fs'
import imagekit from '../lib/imageKit.js';
import Blog from '../models/blog.model.js';
import Comment from '../models/comment.model.js';
import main from '../lib/gemini.js';
import Subscriber from '../models/subscriber.model.js'; 
import nodemailer from 'nodemailer';

const sendNewBlogEmail = async (blog) => {
    try {
        const subscribers = await Subscriber.find({});
        const emails = subscribers.map(subscriber => subscriber.email);

        if (emails.length === 0) {
            console.log("No subscribers to notify.");
            return;
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });

        const mailOptions = {
            from: `"OpenDiary" <${process.env.GMAIL_USER}>`,
            to: emails.join(','),
            subject: `New Blog Post: ${blog.title}`,
            html: `
                <h1>${blog.title}</h1>
                <p>${blog.subTitle}</p>
                <img src="${blog.image}" alt="${blog.title}" style="max-width: 600px;"/>
                <div>${blog.description.slice(0, 200)}...</div>
                <a href="${process.env.FRONTEND_URL}/blog/${blog._id}">Read More</a>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log("New blog notification sent to subscribers.");
    } catch (error) {
        console.error("Error sending new blog email:", error);
    }
};

export const addBlog = async (req, res)=>{
    try {
        const {title, subTitle, description, category, isPublished} = JSON.parse(req.body.blog);
        const imageFile = req.file;

        // Check if all fields are present
        if(!title || !description || !category || !imageFile){
            return res.json({success: false, message: "Missing required fields" })
        }

        const fileBuffer = fs.readFileSync(imageFile.path)

        // Upload Image to ImageKit
        const response = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: "/blogs"
        })

        // optimization through imagekit URL transformation
        const optimizedImageUrl = imagekit.url({
            path: response.filePath,
            transformation: [
                {quality: 'auto'}, // Auto compression
                {format: 'webp'},  // Convert to modern format
                {width: '1280'}    // Width resizing
            ]
        });

        const image = optimizedImageUrl;

        const newBlog = await Blog.create({title, subTitle, description, category, image, isPublished})

        if (isPublished) {
            await sendNewBlogEmail(newBlog);
        }

        res.json({success: true, message: "Blog added successfully"})

    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

export const getAllBlogs = async (req, res)=>{
    try {
        const blogs = await Blog.find({isPublished: true})
        res.json({success: true, blogs})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

export const getBlogById = async (req, res) =>{
    try {
        const { blogId } = req.params;
        const blog = await Blog.findById(blogId)
        if(!blog){
            return res.json({ success: false, message: "Blog not found" });
        }
        res.json({success: true, blog})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

export const deleteBlogById = async (req, res) =>{
    try {
        const { id } = req.body;
        await Blog.findByIdAndDelete(id);

        // Delete all comments associated with the blog
        await Comment.deleteMany({blog: id});

        res.json({success: true, message: 'Blog deleted successfully'})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}


export const togglePublish = async (req, res) =>{
    try {
        const { id } = req.body;
        const blog = await Blog.findById(id);
        blog.isPublished = !blog.isPublished;
        await blog.save();
        res.json({success: true, message: 'Blog status updated'})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}


export const addComment = async (req, res) =>{
    try {
        const {blog, name, content } = req.body;
        await Comment.create({blog, name, content});
        res.json({success: true, message: 'Comment added for review'})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

export const getBlogComments = async (req, res) =>{
    try {
        const {blogId } = req.body;
        const comments = await Comment.find({blog: blogId, isApproved: true}).sort({createdAt: -1});
        res.json({success: true, comments})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

export const generateContent = async (req, res)=>{
    try {
        const {prompt} = req.body;
        const content = await main(prompt + ' Generate a blog content for this topic in simple text format')
        res.json({success: true, content})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}