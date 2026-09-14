'use server'

import prisma from '@/lib/db'
import bcrypt from 'bcrypt'
import { signToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function signupAction(formData: FormData) {
  try {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!name || !email || !password) {
      return { error: 'Todos los campos son obligatorios' }
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return { error: 'Este correo ya está registrado' }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'CLIENT',
      }
    })

    const token = await signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    })

    const cookieStore = await cookies()
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })

    return { success: true, redirect: '/products' }
  } catch (error) {
    console.error('Signup Error:', error)
    return { error: 'Ocurrió un error inesperado al registrarse' }
  }
}

export async function loginAction(formData: FormData) {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
      return { error: 'Email y contraseña son requeridos' }
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return { error: 'Usuario no encontrado' }
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return { error: 'Contraseña incorrecta' }
    }

    const token = await signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    })

    const cookieStore = await cookies()
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })

    let destination = '/products'
    if (user.role === 'ADMIN') destination = '/dashboard/admin'
    if (user.role === 'SELLER') destination = '/dashboard/ventas'
    
    return { success: true, redirect: destination }
  } catch (error) {
    console.error('Login Error:', error)
    return { error: 'Ocurrió un error inesperado al iniciar sesión' }
  }
}

export async function logoutAction() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('auth_token')
    return { success: true, redirect: '/login' }
  } catch (error) {
    return { error: 'Error al cerrar sesión' }
  }
}
