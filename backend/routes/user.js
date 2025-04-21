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
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            throw error;
        }

        const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

        // Set each weekday as unavailable for the new user
        const { error: insertError } = await supabase
            .from('employee_days')
            .insert(weekdays.map(day => ({
                employee_email: email,
                day_of_week: day,
                available: false,
            })));

        if (insertError) {
            throw insertError;
        }

        const user = data.user;

        const { error: roleError } = await supabase
            .from('roles')
            .insert([{ user_id: user.id, role: 'admin' }]);

        if (roleError) {
            return res.status(500).json({ error: 'User created but failed to assign role' });
        }

        res.status(201).json({ message: 'Admin user created successfully', user });

    } catch (error) {
        console.error('Error creating user:', error.message);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

router.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        const user = data.user;

        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        return res.status(200).json({ message: "Login successful" });

    } catch (error) {
        return res.status(500).json({ error: error.message || 'Failed to login' });
    }
});

router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            throw error;
        }
        const user = data.user;

        res.status(201).json({ message: ' user created successfully', user });

    } catch (error) {
        console.error('Error creating user:', error.message);
        res.status(500).json({ error: error.message || 'Failed to create user' });
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
