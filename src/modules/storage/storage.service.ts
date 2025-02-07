import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { FileOptions } from '@supabase/storage-js'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

@Injectable()
export class StorageService {
  private client: SupabaseClient
  private bucket: string

  constructor(private readonly configService: ConfigService) {
    this.client = createClient(
      this.configService.get('supabase').url,
      this.configService.get('supabase').key,
    )
    this.bucket = this.configService.get('supabase').bucket
  }

  async uploadImage(path: string, file: Buffer, options: FileOptions = {}) {
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .upload(path, file, {
        ...options,
      })

    if (error) {
      throw new Error(`Upload File Failed: ${error.message}`)
    }

    return {
      path,
    }
  }

  async getSignedUrl(path: string, expiresIn: number = 600) {
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .createSignedUrl(path, expiresIn)

    if (error) {
      throw new Error(`Get Signed URL Failed: ${error.message}`)
    }

    return data.signedUrl
  }

  async deleteFile(path: string) {
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .remove([path])

    if (error) {
      throw new Error(`Delete File Failed: ${error.message}`)
    }

    return data;
  }
}
