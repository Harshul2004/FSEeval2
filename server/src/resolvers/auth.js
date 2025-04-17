const register = async (_, { input }, { prisma, bcrypt }) => {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email }
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);
    const user = await prisma.user.create({
      data: {
        ...input,
        password: hashedPassword,
        role: 'customer', // Always set role as customer for regular registration
        isActive: true
      }
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      token,
      user
    };
  } catch (error) {
    throw new Error(error.message);
  }
}; 