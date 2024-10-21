import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})


export class PhotoService {
  public photos: UserPhoto[] = [];
  private PHOTO_STORAGE: string = "photos";
  
  constructor() { }
  
  // Tomar una foto con la cámara
  public async takePhoto(): Promise<Photo> {
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });

    const savedImageFile = await this.savePicture(capturedPhoto);
    
    this.photos.unshift(savedImageFile);
    
    // Guardar todas las fotos para mostrarlas en la galería
    Preferences.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos)
    });
    return capturedPhoto;
  };

  // Funcion para cargar las fotos guardadas
  public async loadSaved() {
    // Obtener las fotos guardadas
    const { value } = await Preferences.get({ key: this.PHOTO_STORAGE });
    this.photos = (value ? JSON.parse(value) || [] : []) as UserPhoto[];
    
    // Mostrar la foto obtenida
    for (let photo of this.photos) {
      const readFile = await Filesystem.readFile({
        path: photo.filepath,
        directory: Directory.Data
      });

      // WebviewPath es la ruta de la foto en el sistema de archivos
      photo.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
    };
  };

  // Guardar la foto en el sistema de archivos
  private async savePicture(cameraPhoto: Photo) {
    // Cnvertir la foto a base64, para que pueda guardarla en el sistema de archivos
    const base64Data = await this.readAsBase64(cameraPhoto);
    
    // Escribe el archivo en el directorio de datos
    const fileName = new Date().getTime() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data
    });

    // Obtener la ruta completa del archivo guardado
    return {
      filepath: fileName,
      webviewPath: cameraPhoto.webPath
    };
  };

  // Lee la foto, y la convierte en
  private async readAsBase64(cameraPhoto: Photo) {
    // "Lee" el archivo en base64
    const response = await fetch(cameraPhoto.webPath!);
    const blob = await response.blob();
  
    return await this.convertBlobToBase64(blob) as string;  
  };

  // Convierte un blob en base64
  private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
}

export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
}