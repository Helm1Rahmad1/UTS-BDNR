"use client"

import { useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Camera, Loader2, Trash2, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

interface ProfileFormProps {
  initialData: {
    _id: string
    name: string
    email: string
    avatar?: string
    phone?: string
    bio?: string
    role: string
    createdAt: string
    updatedAt: string
  }
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const { data: session, update } = useSession()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [profile, setProfile] = useState(initialData)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showPasswordFields, setShowPasswordFields] = useState(false)
  
  // Form data
  const [formData, setFormData] = useState({
    name: initialData.name,
    phone: initialData.phone || "",
    bio: initialData.bio || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click()
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("avatar", file)

      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Upload failed")
      }

      setProfile(prev => ({ ...prev, avatar: result.avatar }))
      toast.success("Avatar updated successfully!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload avatar")
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveAvatar = async () => {
    setUploading(true)
    try {
      const response = await fetch("/api/profile/avatar", {
        method: "DELETE",
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to remove avatar")
      }

      setProfile(prev => ({ ...prev, avatar: undefined }))
      toast.success("Avatar removed successfully!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove avatar")
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Validate passwords if changing
      if (showPasswordFields) {
        if (!formData.currentPassword) {
          throw new Error("Current password is required")
        }
        if (!formData.newPassword) {
          throw new Error("New password is required")
        }
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error("New passwords do not match")
        }
        if (formData.newPassword.length < 6) {
          throw new Error("New password must be at least 6 characters")
        }
      }

      const updateData: any = {
        name: formData.name,
        phone: formData.phone,
        bio: formData.bio,
      }

      if (showPasswordFields) {
        updateData.currentPassword = formData.currentPassword
        updateData.newPassword = formData.newPassword
      }

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Update failed")
      }

      setProfile(result.user)
      setIsEditing(false)
      setShowPasswordFields(false)
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }))

      // Update session data
      await update({
        ...session,
        user: {
          ...session?.user,
          name: result.user.name,
        },
      })

      toast.success("Profile updated successfully!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: profile.name,
      phone: profile.phone || "",
      bio: profile.bio || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
    setIsEditing(false)
    setShowPasswordFields(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                {profile.avatar ? (
                  <AvatarImage src={profile.avatar} alt="Avatar" />
                ) : (
                  <AvatarFallback className="bg-muted text-muted-foreground text-2xl">
                    {profile.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              
              {isEditing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer" onClick={handleAvatarClick}>
                  {uploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  ) : (
                    <Camera className="h-6 w-6 text-white" />
                  )}
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-semibold">{profile.name}</h3>
                <Badge variant={profile.role === "admin" ? "default" : "secondary"}>
                  {profile.role}
                </Badge>
              </div>
              <p className="text-muted-foreground">{profile.email}</p>
              
              {isEditing && profile.avatar && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-destructive hover:text-destructive"
                  onClick={handleRemoveAvatar}
                  disabled={uploading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Avatar
                </Button>
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />

          <Separator />

          {/* Form Fields */}
          <div className="grid gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your name"
                />
              ) : (
                <p className="py-2">{profile.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <p className="py-2 text-muted-foreground">{profile.email}</p>
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Enter your phone number"
                />
              ) : (
                <p className="py-2">{profile.phone || "Not provided"}</p>
              )}
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              {isEditing ? (
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  maxLength={500}
                />
              ) : (
                <p className="py-2 whitespace-pre-wrap">{profile.bio || "No bio provided"}</p>
              )}
              {isEditing && (
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.bio.length}/500 characters
                </p>
              )}
            </div>

            {/* Password Change Section */}
            {isEditing && (
              <div className="space-y-4">
                <Separator />
                <div className="flex items-center justify-between">
                  <Label>Change Password</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPasswordFields(!showPasswordFields)}
                  >
                    {showPasswordFields ? "Cancel" : "Change Password"}
                  </Button>
                </div>

                {showPasswordFields && (
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showPasswords.current ? "text" : "password"}
                          value={formData.currentPassword}
                          onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                          placeholder="Enter current password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                          onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                        >
                          {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPasswords.new ? "text" : "password"}
                          value={formData.newPassword}
                          onChange={(e) => handleInputChange("newPassword", e.target.value)}
                          placeholder="Enter new password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                          onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        >
                          {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showPasswords.confirm ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                          placeholder="Confirm new password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                          onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        >
                          {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel} disabled={loading}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Member Since</p>
              <p className="font-medium">
                {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Last Updated</p>
              <p className="font-medium">
                {new Date(profile.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}