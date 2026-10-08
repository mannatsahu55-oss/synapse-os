import nilearn.datasets
import nibabel as nib
import numpy as np

print("Fetching fsaverage mesh...")
# fsaverage5 is a lower resolution mesh (10k vertices per hemisphere)
# which is perfect for real-time 3D rendering (20k vertices total)
fsaverage = nilearn.datasets.fetch_surf_fsaverage('fsaverage5')

print("Loading left hemisphere...")
mesh_l = nib.load(fsaverage.pial_left).darrays
coords_l = mesh_l[0].data
faces_l = mesh_l[1].data

print("Loading right hemisphere...")
mesh_r = nib.load(fsaverage.pial_right).darrays
coords_r = mesh_r[0].data
faces_r = mesh_r[1].data

# Offset right faces by the number of left vertices
faces_r_offset = faces_r + coords_l.shape[0]

# Combine hemispheres
all_coords = np.vstack((coords_l, coords_r))
all_faces = np.vstack((faces_l, faces_r_offset))

# Center the brain and scale it down slightly
centroid = np.mean(all_coords, axis=0)
all_coords = (all_coords - centroid) / 50.0

print(f"Combined mesh has {all_coords.shape[0]} vertices and {all_faces.shape[0]} faces.")

print("Saving to public/brain.obj...")
with open('public/brain.obj', 'w') as f:
    f.write("# Generated Brain OBJ\n")
    for v in all_coords:
        # Note: inverting Z axis maybe necessary depending on coordinate system, 
        # but we can handle that in Three.js
        f.write(f"v {v[0]} {v[1]} {v[2]}\n")
    for face in all_faces:
        # OBJ indices are 1-based
        f.write(f"f {face[0]+1} {face[1]+1} {face[2]+1}\n")

print("Done!")
