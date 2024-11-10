import { Component, inject, input, OnInit, output } from '@angular/core';
import { Member } from '../../_models/member';
import { DecimalPipe, NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { FileUploader, FileUploadModule } from 'ng2-file-upload';
import { AccountService } from '../../_services/account.service';
import { environment } from '../../../environments/environment';
import { Photo } from '../../_models/photo';
import { MembersService } from '../../_services/members.service';

@Component({
    selector: 'app-photo-editor',
    standalone: true,
    imports: [NgIf, NgFor, NgStyle, NgClass, FileUploadModule, DecimalPipe],
    templateUrl: './photo-editor.component.html',
    styleUrl: './photo-editor.component.css',
})
export class PhotoEditorComponent implements OnInit {
    private accountService = inject(AccountService);
    private membersService = inject(MembersService);

    member = input.required<Member>();
    memberChange = output<Member>();

    uploader?: FileUploader;
    hasBaseDropZoneOver = false;
    baseUrl = environment.apiUrl;

    ngOnInit(): void {
        this.initializeUploader();
    }

    fileOverBase(e: any) {
        this.hasBaseDropZoneOver = e;
    }

    setMainPhoto(photo: Photo) {
        this.membersService.setMainPhoto(photo).subscribe({
            next: _ => {
                this.updateUserMainPhotoUrl(photo.url);
                const updatedMember: Member = {
                    ...this.member(),
                    photoUrl: photo.url,
                };
                updatedMember.photos.forEach(p => {
                    if (p.isMain) p.isMain = false;
                    if (p.id === photo.id) p.isMain = true;
                });
                this.memberChange.emit(updatedMember);
            },
        });
    }

    deletePhoto(photo: Photo) {
        this.membersService.deletePhoto(photo).subscribe({
            next: _ => {
                const updatedMember = { ...this.member() };
                updatedMember.photos = updatedMember.photos.filter(
                    p => p.id !== photo.id,
                );
                this.memberChange.emit(updatedMember);
            },
        });
    }

    initializeUploader() {
        this.uploader = new FileUploader({
            url: this.baseUrl + 'users/add-photo',
            authToken: 'Bearer ' + this.accountService.currentUser()?.token,
            isHTML5: true,
            allowedFileType: ['image'],
            removeAfterUpload: true,
            autoUpload: false,
            maxFileSize: 10 * 1024 * 1024,
        });

        this.uploader.onAfterAddingFile = file => {
            file.withCredentials = false;
        };

        this.uploader.onSuccessItem = (item, response, status, headers) => {
            const photo = JSON.parse(response);
            const updatedMember = { ...this.member() };
            updatedMember.photos.push(photo);
            this.memberChange.emit(updatedMember);
            if (photo.isMain) {
                this.updateUserMainPhotoUrl(photo.url);
                updatedMember.photoUrl = photo.url;
                updatedMember.photos.forEach(p => {
                    if (p.isMain) p.isMain = false;
                    if (p.id === photo.id) p.isMain = true;
                });
                this.memberChange.emit(updatedMember);
            }
        };
    }

    private updateUserMainPhotoUrl(photoUrl: string) {
        const user = this.accountService.currentUser();
        if (user) {
            user.photoUrl = photoUrl;
            this.accountService.setCurrentUser(user);
        }
    }
}
