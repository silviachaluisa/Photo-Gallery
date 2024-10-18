import { Injectable } from '@angular/core';
import {Camera, CameraResultType, CameraSource, Photo} from '@capacitor/camera';
import { WebView } from '@capacitor/core';
import{Filesystem, Directory} from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  public photos: UserPhoto[] = [];
  private PHOTO_STORAGE: string = 'photos';

  // Función para convertir una imagen en base64
  private async readAsBase64(photo: Photo): Promise<string> {
    // Fetch the photo, read as a blob, then convert to base64 format
    const response = await fetch(photo.webPath!);
    const blob = await response.blob();
    return await this.convertBlobToBase64(blob) as string;
  }

  // Función para convertir un Blob en base64
  private convertBlobToBase64 = (blob: Blob): Promise<string | ArrayBuffer | null> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });
  };

  // Función para guardar la imagen en el sistema de archivos
  private async savePicture(photo: Photo): Promise<UserPhoto> {
    // Convertir la foto a base64
    const base64Data = await this.readAsBase64(photo);

    // Escribir el archivo en el directorio de datos
    const fileName = Date.now() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data
    });

    // Devolver la ruta del archivo guardado
    return {
      filepath: fileName,
      webviewPath: photo.webPath
    };
  }

  constructor() {}

  // Añadir nueva foto a la galería
  public async addNewToGallery() {
    // Tomar una foto
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });
    Preferences.set({
      key:this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos),
    });

    // Guardar la imagen y añadirla a la colección de fotos
    const savedImageFile = await this.savePicture(capturedPhoto);
    this.photos.unshift(savedImageFile);
  }
}
public async loadSaved(){
  //Retrieve cached
}

// Definición de la interfaz UserPhoto
export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
}