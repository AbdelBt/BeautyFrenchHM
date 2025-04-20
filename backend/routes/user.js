const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);


router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            throw error;
        }

        const user = data.user;

        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        const { data: roleData, error: roleError } = await supabase
            .from('roles')
            .select('role')
            .eq('user_id', user.id)
            .single();

        if (roleError) {
            return res.status(400).json({ error: 'Error fetching role' });
        }

        if (roleData.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admins only.' });
        }

        res.status(200).json({ message: 'User logged in successfully', data: data });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


router.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    try {
        const { user, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            throw error;
        }


        res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
        console.error('Error creating user:', error.message);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

router.get('/users', async (req, res) => {
    try {
        const { data, error } = await supabase.auth.admin.listUsers();

        if (error) {
            throw error;
        }

        res.status(200).json({ users: data });
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});


module.exports = router;
