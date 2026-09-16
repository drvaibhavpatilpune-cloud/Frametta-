# Z-Anatomy knee extraction

Source (CC BY-SA 4.0):
- https://github.com/Z-Anatomy/Models-of-human-anatomy
- https://github.com/LluisV/Z-Anatomy (FBX under Resources/Models/FBX)
- https://www.z-anatomy.com/

Pipeline used for Ortho3D:
1. Download `Joints100.fbx`, `SkeletalSystem100.fbx`, `MuscularSystem100.fbx`
2. Convert with Assimp: `assimp export file.fbx file.glb`
3. Extract unilateral knee meshes (Femur.001 side + matching .002 ligaments)
4. Center on femur/tibia/patella centroid, scale to ~3.6 height
5. Export per-structure GLBs into `public/models/z-anatomy-knee/`

ShareAlike: adaptations remain under CC BY-SA 4.0 — see ATTRIBUTION.md in that folder.
